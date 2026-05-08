import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

function distinctValues(column) {
  const rows = getDb()
    .prepare(`SELECT DISTINCT ${column} as v FROM listings WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column}`)
    .all();
  return rows.map((r) => r.v);
}

function distinctPairs(a, b) {
  const rows = getDb()
    .prepare(`SELECT DISTINCT ${a} as a, ${b} as b FROM listings WHERE ${a} IS NOT NULL AND ${b} IS NOT NULL ORDER BY ${a}, ${b}`)
    .all();
  return rows;
}

router.get('/options', (_req, res) => {
  const db = getDb();
  const ranges = db
    .prepare('SELECT MIN(price) as minP, MAX(price) as maxP, MIN(mileage) as minM, MAX(mileage) as maxM, MIN(year) as minY, MAX(year) as maxY FROM listings')
    .get();

  const sources = new Set();
  for (const row of db.prepare('SELECT sources FROM listings').all()) {
    try {
      const arr = JSON.parse(row.sources || '[]');
      arr.forEach((s) => s && s.site && sources.add(s.site));
    } catch { /* noop */ }
  }

  res.json({
    makes: distinctValues('make'),
    models: distinctPairs('make', 'model'),
    bodyStyles: distinctValues('bodyStyle'),
    fuelTypes: distinctValues('fuelType'),
    transmissions: distinctValues('transmission'),
    drivetrains: distinctValues('drivetrain'),
    exteriorColors: distinctValues('exteriorColor'),
    sources: [...sources],
    priceRange: { min: ranges.minP ?? 0, max: ranges.maxP ?? 150000 },
    mileageRange: { min: ranges.minM ?? 0, max: ranges.maxM ?? 200000 },
    yearRange: { min: ranges.minY ?? 1990, max: ranges.maxY ?? new Date().getFullYear() },
  });
});

export default router;
