import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.MARKETCHECK_API_KEY;
const BASE_URL = 'https://api.marketcheck.com/v2';

if (!API_KEY) {
  console.warn(
    '[autogrid] WARNING: MARKETCHECK_API_KEY is not set. Copy .env.example → .env and add your key.'
  );
}

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- helpers ---------- */

const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY ?? '');
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    url.searchParams.set(k, String(v));
  }
  return url.toString();
};

const fetchUpstream = async (url) => {
  const res = await fetch(url);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(body?.message || `Upstream ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
};

const mapListing = (car = {}) => {
  const build = car.build || {};
  const dealer = car.dealer || {};
  const photos = car.media?.photo_links || [];
  return {
    id: car.id,
    vin: car.vin,
    year: build.year,
    make: build.make,
    model: build.model,
    trim: build.trim,
    price: car.price,
    mileage: car.miles,
    exteriorColor: car.exterior_color,
    interiorColor: car.interior_color,
    transmission: build.transmission,
    drivetrain: build.drivetrain,
    fuelType: build.fuel_type,
    bodyStyle: build.body_type,
    engine: build.engine,
    mpgCity: build.city_mpg,
    mpgHighway: build.highway_mpg,
    imageUrl: photos[0] || null,
    photoCount: photos.length,
    dealerName: dealer.name,
    dealerCity: dealer.city,
    dealerState: dealer.state,
    dealerPhone: dealer.phone,
    daysOnMarket: car.dom,
    carType: car.car_type,
    sourceUrl: car.vdp_url,
    listingDate: car.first_seen_at_date,
  };
};

const passthroughParams = (q) => {
  const out = {};
  const direct = [
    'make',
    'model',
    'trim',
    'car_type',
    'body_style',
    'transmission',
    'drivetrain',
    'fuel_type',
    'exterior_color',
    'interior_color',
    'zip',
    'sort_by',
    'sort_order',
  ];
  for (const k of direct) if (q[k]) out[k] = q[k];

  // year — "2018-2024" → year_range
  if (q.year) out.year_range = q.year;
  if (q.year_range) out.year_range = q.year_range;

  // price/mileage — already in "min-max" form
  if (q.price_range) out.price_range = q.price_range;
  if (q.mileage_range) out.mileage_range = q.mileage_range;

  // location
  out.radius = q.radius || 100;

  // pagination
  out.rows = Math.min(Number(q.rows) || 24, 50);
  out.start = Number(q.start) || 0;

  // free-text search → MarketCheck `query` parameter
  if (q.q) out.query = q.q;

  return out;
};

/* ---------- routes ---------- */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasKey: Boolean(API_KEY) });
});

// 1. /api/listings — search
app.get('/api/listings', async (req, res) => {
  try {
    const params = passthroughParams(req.query);
    const url = buildUrl('/search/car/active', params);
    const data = await fetchUpstream(url);
    res.json({
      totalCount: data.num_found ?? 0,
      listings: (data.listings || []).map(mapListing),
    });
  } catch (err) {
    console.error('[/api/listings]', err.status, err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message, details: err.body });
  }
});

// 2. /api/listings/:id — full detail
app.get('/api/listings/:id', async (req, res) => {
  try {
    const url = buildUrl(`/listing/car/${encodeURIComponent(req.params.id)}`);
    const data = await fetchUpstream(url);
    const photos = data?.media?.photo_links || [];
    res.json({
      ...data,
      mapped: mapListing(data),
      photos,
    });
  } catch (err) {
    console.error('[/api/listings/:id]', err.status, err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message, details: err.body });
  }
});

// 3. /api/filters/options — facet values for the sidebar
app.get('/api/filters/options', async (req, res) => {
  try {
    const url = buildUrl('/search/car/active', {
      facets:
        'make,model,body_type,exterior_color,transmission,drivetrain,fuel_type,car_type',
      rows: 0,
      ...(req.query.zip ? { zip: req.query.zip } : {}),
      ...(req.query.radius ? { radius: req.query.radius } : {}),
    });
    const data = await fetchUpstream(url);
    const f = data.facets || {};
    const keys = (obj) => (obj ? Object.keys(obj).filter(Boolean) : []);

    const currentYear = new Date().getFullYear();
    res.json({
      makes: keys(f.make).sort(),
      models: keys(f.model).sort(),
      bodyStyles: keys(f.body_type).sort(),
      colors: keys(f.exterior_color).sort(),
      transmissions: keys(f.transmission).sort(),
      drivetrains: keys(f.drivetrain).sort(),
      fuelTypes: keys(f.fuel_type).sort(),
      carTypes: ['new', 'used', 'certified'],
      priceRange: { min: 0, max: 150000 },
      mileageRange: { min: 0, max: 250000 },
      yearRange: { min: 1990, max: currentYear },
    });
  } catch (err) {
    console.error('[/api/filters/options]', err.status, err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message, details: err.body });
  }
});

// 4. /api/models?make=Toyota — populate Model dropdown
app.get('/api/models', async (req, res) => {
  try {
    if (!req.query.make) {
      return res.json({ models: [] });
    }
    const url = buildUrl('/search/car/active', {
      facets: 'model',
      rows: 0,
      make: req.query.make,
    });
    const data = await fetchUpstream(url);
    const modelFacet = data.facets?.model || {};
    res.json({ models: Object.keys(modelFacet).filter(Boolean).sort() });
  } catch (err) {
    console.error('[/api/models]', err.status, err.message);
    res
      .status(err.status || 500)
      .json({ error: err.message, details: err.body });
  }
});

app.listen(PORT, () => {
  console.log(`[autogrid] server listening on http://localhost:${PORT}`);
});
