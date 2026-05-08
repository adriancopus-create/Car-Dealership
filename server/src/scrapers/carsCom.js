import * as cheerio from 'cheerio';
import { fetchHtml, delay } from './base.js';
import { cleanText, parseTitle, toFloat, toInt, inferBodyStyle } from '../util/normalize.js';
import { fixtures } from './fixtures.js';

const SOURCE = 'Cars.com';
const SEARCH_URL = 'https://www.cars.com/shopping/results/';

// Best-effort extractor – cars.com markup changes often. Returns array of
// normalized listings, or [] on failure (caller handles fallback).
async function scrapeLive({ max = 40, requestDelay = 1500 } = {}) {
  const html = await fetchHtml(SEARCH_URL, { timeoutMs: 20000 });
  const $ = cheerio.load(html);
  const out = [];
  const cards = $('.vehicle-card');
  cards.each((_, el) => {
    if (out.length >= max) return false;
    const $el = $(el);
    const title = cleanText($el.find('.title, h2.title').first().text());
    const priceTxt = $el.find('.primary-price').first().text();
    const mileageTxt = $el.find('.mileage').first().text();
    const location = cleanText($el.find('.miles-from, .dealer-name + div').first().text());
    const dealerName = cleanText($el.find('.dealer-name').first().text());
    const imageUrl = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
    const href = $el.find('a.vehicle-card-link').attr('href') || $el.find('a').first().attr('href');
    const listingId = $el.attr('data-listing-id') || (href && href.match(/\/(\d+)\//)?.[1]);
    if (!title || !listingId) return;
    const { year, make, model, trim } = parseTitle(title);
    out.push({
      listingId: `cars-${listingId}`,
      title,
      year, make, model, trim,
      bodyStyle: inferBodyStyle(title),
      price: toFloat(priceTxt),
      mileage: toInt(mileageTxt),
      location,
      dealerName,
      imageUrl,
      images: imageUrl ? [imageUrl] : [],
      sourceUrl: href?.startsWith('http') ? href : `https://www.cars.com${href || ''}`,
      sourceSite: SOURCE,
    });
  });
  await delay(requestDelay);
  return out;
}

export async function scrapeCarsCom(opts = {}) {
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
