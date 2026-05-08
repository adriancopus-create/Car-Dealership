import { pickUserAgent, delay } from '../util/userAgents.js';

// Best-effort HTTP fetch with rotating UA. Used for static-HTML scraping.
// JS-rendered targets should use Playwright via withBrowser().
export async function fetchHtml(url, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': pickUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status} for ${url}`);
      err.status = res.status;
      throw err;
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// Lazy-load Playwright so the server can run without it installed.
let _browser;
export async function withBrowser(fn) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    throw new Error('playwright not installed – run `npx playwright install chromium`');
  }
  if (!_browser) {
    _browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    });
  }
  const ctx = await _browser.newContext({ userAgent: pickUserAgent() });
  const page = await ctx.newPage();
  try {
    return await fn(page);
  } finally {
    await ctx.close();
  }
}

export async function shutdownBrowser() {
  if (_browser) {
    try { await _browser.close(); } catch { /* noop */ }
    _browser = null;
  }
}

export { delay };
