# AutoGrid

A full-stack car listings aggregator. AutoGrid scrapes [Cars.com](https://www.cars.com/shopping/results/), [CarGurus](https://www.cargurus.com/Cars/new/nl_NewCars.action), and [AutoTrader](https://www.autotrader.com/cars-for-sale/), normalizes the results, deduplicates physical cars across sources, and presents them in a single filterable, searchable interface.

```
.
├── client/           React + Vite + Tailwind frontend
└── server/           Node + Express + SQLite + scrapers
```

## Tech stack

- **Backend:** Node.js, Express, `better-sqlite3` for storage, Playwright + Cheerio for scraping
- **Frontend:** React 18, Vite, Tailwind CSS
- **Storage:** SQLite (file by default; switch to `:memory:` via `DB_PATH=:memory:`)

## Quick start

```bash
# 1. Install deps for both workspaces
npm run install:all

# 2. Configure environment
cp .env.example .env
# Edit .env – the default `USE_MOCK_DATA=true` runs the app against bundled
# fixtures so you can develop without hitting the real sites.

# 3. (Optional) Install Chromium for live scraping
cd server && npx playwright install chromium && cd ..

# 4. Start backend + frontend together
npm run dev

# Backend listens on http://localhost:4000
# Frontend dev server on http://localhost:5173 (proxies /api -> 4000)
```

## API

- `GET /api/listings` — paginated listings with query params:
  `make, model, minPrice, maxPrice, minMileage, maxMileage, minYear, maxYear,
   bodyStyle, fuelType, transmission, drivetrain, exteriorColor, source, search,
   sort, page, limit` (any list param accepts comma-separated values, e.g. `make=Toyota,Honda`).
  Sort options: `recent`, `price-asc`, `price-desc`, `mileage-asc`, `year-asc`, `year-desc`.
- `GET /api/listings/:id` — single listing with merged sources and full specs.
- `GET /api/filters/options` — dynamic filter values derived from the current dataset, plus min/max price, mileage, year ranges.
- `POST /api/scrape/refresh?force=true` — triggers a fresh scrape across all three sources and returns per-source status.

## Deduplication

After every scrape, listings are merged into the SQLite store using a fingerprint of `year + make + model + trim + bucketed mileage + bucketed price`. Existing rows whose price is within ±$500 and mileage within ±200 mi of the new listing are merged: each `sourceUrl` is preserved on a `sources` array on the row so the UI can show "Listed on N sites" badges and per-source links. The canonical card price is the lowest seen across all sources.

## Configuration

| Var | Default | Description |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allow-list |
| `DB_PATH` | `./data/autogrid.db` | SQLite file path (`:memory:` to disable persistence) |
| `SCRAPE_ON_START` | `true` | Run scrapers on server boot |
| `SCRAPE_INTERVAL_MS` | `14400000` (4h) | Periodic scrape interval, `0` to disable |
| `SCRAPE_CACHE_TTL_MS` | `14400000` (4h) | Skip scraping if last run is fresher than this |
| `SCRAPE_REQUEST_DELAY_MS` | `1500` | Polite per-domain delay between requests |
| `SCRAPE_MAX_PER_SOURCE` | `40` | Max listings per source per run |
| `USE_MOCK_DATA` | `true` | Use bundled fixtures instead of live scraping |
| `SCRAPE_NAV_TIMEOUT_MS` | `30000` | Playwright navigation timeout |

## Known scraping limitations

Cars.com, CarGurus and AutoTrader are heavily protected. In practice:

- **They detect and block headless browsers and unusual UAs.** AutoGrid rotates User-Agents, adds randomized request delays, and uses Playwright with `--disable-blink-features=AutomationControlled`, but you should still expect intermittent blocks.
- **Markup changes frequently.** The CSS selectors in `server/src/scrapers/*.js` target current public class names (e.g. `.vehicle-card`, `[data-cg-ft="srp-listing-blade"]`, `[data-cmp="inventoryListing"]`); when the sites change theirs the parser will yield zero rows, at which point AutoGrid falls back to fixtures and records a `blocked` status in the `scrape_runs` table.
- **Each site's ToS / `robots.txt` should be respected.** AutoGrid is intended as an educational reference for aggregator architecture; before pointing it at production data, read each site's terms and confirm you have a legitimate basis (or use a sanctioned data API instead).
- For local development and demos, leave `USE_MOCK_DATA=true`. The bundled fixtures include intentional duplicates so you can see the deduplication and "Listed on 3 sites" UI working.

## CLI helpers

```bash
# Run a one-off scrape (force, ignores cache TTL):
npm run scrape --workspace=server

# Build frontend bundle:
npm run build
```

## Project layout

```
server/
├── src/
│   ├── index.js              Express app + bootstrap
│   ├── db.js                 SQLite + meta helpers
│   ├── routes/
│   │   ├── listings.js       /api/listings + /api/listings/:id
│   │   ├── filters.js        /api/filters/options
│   │   └── scrape.js         /api/scrape/refresh
│   ├── scrapers/
│   │   ├── base.js           HTTP + Playwright helpers
│   │   ├── carsCom.js        Cars.com adapter
│   │   ├── carGurus.js       CarGurus adapter
│   │   ├── autoTrader.js     AutoTrader adapter
│   │   ├── fixtures.js       Demo/fallback data
│   │   └── runner.js         Orchestration + dedup + persistence
│   └── util/
│       ├── normalize.js      Field cleanup + fingerprint
│       └── userAgents.js     UA rotation + delay helper

client/
├── src/
│   ├── App.jsx               Filters + grid wiring
│   ├── api.js                fetch() wrappers
│   ├── format.js             $/mileage/timeAgo helpers
│   └── components/
│       ├── Header.jsx
│       ├── FilterSidebar.jsx
│       ├── RangeSlider.jsx
│       ├── MultiSelect.jsx
│       ├── ListingGrid.jsx
│       ├── ListingCard.jsx
│       ├── ListingDetailModal.jsx
│       ├── EmptyState.jsx
│       └── SourceBadge.jsx
```
