import * as cheerio from 'cheerio';
import { fetchHtml, withBrowser, delay } from './base.js';
import { cleanText, parseTitle, toFloat, toInt, inferBodyStyle } from '../util/normalize.js';
import { fixtures } from './fixtures.js';

const SOURCE = 'CarGurus';
const SEARCH_URL = 'https://www.cargurus.com/Cars/new/nl_NewCars.action';

async function scrapeLive({ max = 40, requestDelay = 1500, navTimeout = 30000 } = {}) {
  // CarGurus is heavily JS-rendered; try Playwright first, then fall back to plain HTTP.
  let html;
  try {
    html = await withBrowser(async (page) => {
      await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: navTimeout });
      await page.waitForSelector('[data-cg-ft="srp-listing-blade"], .cg-dealFinder-result-wrap', { timeout: navTimeout }).catch(() => {});
      return page.content();
    });
  } catch {
    html = await fetchHtml(SEARCH_URL, { timeoutMs: 20000 });
  }
  const $ = cheerio.load(html);
  const out = [];
  $('[data-cg-ft="srp-listing-blade"], .cg-dealFinder-result-wrap').each((_, el) => {
    if (out.length >= max) return false;
    const $el = $(el);
    const title = cleanText($el.find('h4, h2, .listing-title').first().text());
    const priceTxt = $el.find('[data-cg-ft="srp-listing-blade-price"], .listing-price').first().text();
    const mileageTxt = $el.find('[data-cg-ft="srp-listing-blade-mileage"], .listing-mileage').first().text();
    const location = cleanText($el.find('[data-cg-ft="srp-listing-blade-distance"], .seller-distance').first().text());
    const imageUrl = $el.find('img').first().attr('src');
    const href = $el.find('a').first().attr('href') || '';
    const listingId = href.match(/listingId=(\d+)/)?.[1] || $el.attr('data-listing-id');
    if (!title || !listingId) return;
    const { year, make, model, trim } = parseTitle(title);
    out.push({
      listingId: `cg-${listingId}`,
      title,
      year, make, model, trim,
      bodyStyle: inferBodyStyle(title),
      price: toFloat(priceTxt),
      mileage: toInt(mileageTxt),
      location,
      imageUrl,
      images: imageUrl ? [imageUrl] : [],
      sourceUrl: href.startsWith('http') ? href : `https://www.cargurus.com${href}`,
      sourceSite: SOURCE,
    });
  });
  await delay(requestDelay);
  return out;
}

export async function scrapeCarGurus(opts = {}) {
  if (process.env.USE_MOCK_DATA === 'true') {
    return { source: SOURCE, listings: fixtures[SOURCE], status: 'mock' };
  }
  try {
    const listings = await scrapeLive(opts);
    if (!listings.length) {
      return { source: SOURCE, listings: fixtures[SOURCE], status: 'blocked', message: 'no cards parsed – using fixtures' };
    }
    return { source: SOURCE, listings, status: 'ok' };
  } catch (err) {
    console.warn(`[scraper:${SOURCE}] live scrape failed: ${err.message} – falling back to fixtures`);
    return { source: SOURCE, listings: fixtures[SOURCE], status: 'blocked', message: err.message };
  }
}
