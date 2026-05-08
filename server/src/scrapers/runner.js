import crypto from 'node:crypto';
import { getDb, getMeta, setMeta } from '../db.js';
import { makeFingerprint } from '../util/normalize.js';
import { scrapeCarsCom } from './carsCom.js';
import { scrapeCarGurus } from './carGurus.js';
import { scrapeAutoTrader } from './autoTrader.js';
import { shutdownBrowser } from './base.js';

let _running = false;
let _interval;

const SCRAPERS = [
  { name: 'Cars.com', fn: scrapeCarsCom },
  { name: 'CarGurus', fn: scrapeCarGurus },
  { name: 'AutoTrader', fn: scrapeAutoTrader },
];

function recordRun(source, status, count, message) {
  getDb()
    .prepare(
      `INSERT INTO scrape_runs(source, startedAt, finishedAt, status, count, message)
       VALUES(?, ?, ?, ?, ?, ?)`,
    )
    .run(source, Date.now(), Date.now(), status, count, message || null);
}

function makeId() {
  return crypto.randomBytes(8).toString('hex');
}

// Merge a new scrape result into existing rows. Dedup uses fingerprint and
// also a tighter price/mileage tolerance check. When duplicates are found we
// merge sources arrays so a card can show "Listed on N sites".
export function mergeListings(scraped) {
  const db = getDb();
  const now = Date.now();
  const insert = db.prepare(`
    INSERT INTO listings(
      id, fingerprint, title, price, mileage, year, make, model, trim, bodyStyle,
      transmission, fuelType, drivetrain, exteriorColor, interiorColor,
      engine, mpgCity, mpgHighway, vin, location, dealerName, dealerPhone,
      description, imageUrl, images, sources, firstSeen, lastSeen
    ) VALUES (
      @id, @fingerprint, @title, @price, @mileage, @year, @make, @model, @trim, @bodyStyle,
      @transmission, @fuelType, @drivetrain, @exteriorColor, @interiorColor,
      @engine, @mpgCity, @mpgHighway, @vin, @location, @dealerName, @dealerPhone,
      @description, @imageUrl, @images, @sources, @firstSeen, @lastSeen
    )
  `);
  const updateSources = db.prepare(`
    UPDATE listings SET sources = ?, lastSeen = ?, price = ?, imageUrl = COALESCE(imageUrl, ?)
    WHERE id = ?
  `);

  const tx = db.transaction((items) => {
    for (const l of items) {
      const fp = makeFingerprint(l);
      // tighter match: same fingerprint + within tolerance
      const candidates = db
        .prepare('SELECT * FROM listings WHERE fingerprint = ?')
        .all(fp);
      const match = candidates.find((c) => {
        const priceOk = c.price == null || l.price == null
          ? true
          : Math.abs(c.price - l.price) <= 500;
        const mileOk = c.mileage == null || l.mileage == null
          ? true
          : Math.abs(c.mileage - l.mileage) <= 200;
        return priceOk && mileOk;
      });

      const newSourceEntry = {
        site: l.sourceSite,
        url: l.sourceUrl,
        listingId: l.listingId,
        price: l.price,
      };

      if (match) {
        const existing = JSON.parse(match.sources || '[]');
        const filtered = existing.filter((s) => s.site !== l.sourceSite || s.listingId !== l.listingId);
        filtered.push(newSourceEntry);
        // canonical price = lowest seen
        const lowestPrice = filtered
          .map((s) => s.price)
          .filter((p) => typeof p === 'number')
          .sort((a, b) => a - b)[0] ?? match.price;
        updateSources.run(JSON.stringify(filtered), now, lowestPrice, l.imageUrl, match.id);
      } else {
        insert.run({
          id: makeId(),
          fingerprint: fp,
          title: l.title,
          price: l.price ?? null,
          mileage: l.mileage ?? null,
          year: l.year ?? null,
          make: l.make ?? null,
          model: l.model ?? null,
          trim: l.trim ?? null,
          bodyStyle: l.bodyStyle ?? null,
          transmission: l.transmission ?? null,
          fuelType: l.fuelType ?? null,
          drivetrain: l.drivetrain ?? null,
          exteriorColor: l.exteriorColor ?? null,
          interiorColor: l.interiorColor ?? null,
          engine: l.engine ?? null,
          mpgCity: l.mpgCity ?? null,
          mpgHighway: l.mpgHighway ?? null,
          vin: l.vin ?? null,
          location: l.location ?? null,
          dealerName: l.dealerName ?? null,
          dealerPhone: l.dealerPhone ?? null,
          description: l.description ?? null,
          imageUrl: l.imageUrl ?? null,
          images: JSON.stringify(l.images || []),
          sources: JSON.stringify([newSourceEntry]),
          firstSeen: now,
          lastSeen: now,
        });
      }
    }
  });

  tx(scraped);
}

export async function runAllScrapers({ trigger = 'manual', force = false } = {}) {
  if (_running) return { skipped: true, reason: 'already running' };
  _running = true;

  const ttl = parseInt(process.env.SCRAPE_CACHE_TTL_MS || '14400000', 10);
  const last = parseInt(getMeta('lastScrapeAt') || '0', 10);
  if (!force && last && Date.now() - last < ttl) {
    _running = false;
    return { skipped: true, reason: 'within cache TTL', lastScrapeAt: last };
  }

  console.log(`[autogrid] scrape run starting (trigger=${trigger})`);
  const results = [];
  const max = parseInt(process.env.SCRAPE_MAX_PER_SOURCE || '40', 10);
  const requestDelay = parseInt(process.env.SCRAPE_REQUEST_DELAY_MS || '1500', 10);
  const navTimeout = parseInt(process.env.SCRAPE_NAV_TIMEOUT_MS || '30000', 10);

  for (const s of SCRAPERS) {
    try {
      const r = await s.fn({ max, requestDelay, navTimeout });
      mergeListings(r.listings || []);
      recordRun(s.name, r.status, (r.listings || []).length, r.message);
      results.push({ source: s.name, status: r.status, count: (r.listings || []).length });
      console.log(`[autogrid] ${s.name}: ${r.status} (${(r.listings || []).length} listings)`);
    } catch (err) {
      recordRun(s.name, 'error', 0, err.message);
      results.push({ source: s.name, status: 'error', count: 0, error: err.message });
      console.error(`[autogrid] ${s.name} failed`, err);
    }
  }

  setMeta('lastScrapeAt', Date.now());
  await shutdownBrowser();
  _running = false;
  return { trigger, results, lastScrapeAt: Date.now() };
}

export function scheduleScraping() {
  const interval = parseInt(process.env.SCRAPE_INTERVAL_MS || '0', 10);
  if (!interval) return;
  if (_interval) clearInterval(_interval);
  _interval = setInterval(() => {
    runAllScrapers({ trigger: 'interval' }).catch((err) =>
      console.error('[autogrid] interval scrape failed', err),
    );
  }, interval);
}
