import { Router } from 'express';
import { getDb, getMeta } from '../db.js';

const router = Router();

function rowToListing(row) {
  if (!row) return null;
  return {
    ...row,
    images: row.images ? JSON.parse(row.images) : [],
    sources: row.sources ? JSON.parse(row.sources) : [],
  };
}

function parseList(value) {
  if (!value) return null;
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

router.get('/', (req, res) => {
  const db = getDb();
  const {
    make, model, bodyStyle, fuelType, transmission, drivetrain,
    exteriorColor, source, search, sort,
    minPrice, maxPrice, minMileage, maxMileage, minYear, maxYear,
    page = '1', limit = '24',
  } = req.query;

  const where = [];
  const params = [];

  function addInClause(column, raw) {
    const list = parseList(raw);
    if (!list || !list.length) return;
    where.push(`${column} IN (${list.map(() => '?').join(',')})`);
    params.push(...list);
  }

  addInClause('make', make);
  addInClause('model', model);
  addInClause('bodyStyle', bodyStyle);
  addInClause('fuelType', fuelType);
  addInClause('transmission', transmission);
  addInClause('drivetrain', drivetrain);
  addInClause('exteriorColor', exteriorColor);

  if (minPrice) { where.push('(price IS NULL OR price >= ?)'); params.push(parseFloat(minPrice)); }
  if (maxPrice) { where.push('(price IS NULL OR price <= ?)'); params.push(parseFloat(maxPrice)); }
  if (minMileage) { where.push('(mileage IS NULL OR mileage >= ?)'); params.push(parseInt(minMileage, 10)); }
  if (maxMileage) { where.push('(mileage IS NULL OR mileage <= ?)'); params.push(parseInt(maxMileage, 10)); }
  if (minYear) { where.push('(year IS NULL OR year >= ?)'); params.push(parseInt(minYear, 10)); }
  if (maxYear) { where.push('(year IS NULL OR year <= ?)'); params.push(parseInt(maxYear, 10)); }

  if (search) {
    where.push('(LOWER(title) LIKE ? OR LOWER(make) LIKE ? OR LOWER(model) LIKE ? OR LOWER(trim) LIKE ? OR LOWER(description) LIKE ?)');
    const q = `%${String(search).toLowerCase()}%`;
    params.push(q, q, q, q, q);
  }

  // Source filter requires JSON LIKE since sources are stored as a JSON array.
  const sourceList = parseList(source);
  if (sourceList && sourceList.length) {
    const orParts = sourceList.map(() => `sources LIKE ?`);
    where.push(`(${orParts.join(' OR ')})`);
    params.push(...sourceList.map((s) => `%"site":"${s}"%`));
  }

  let orderBy = 'lastSeen DESC';
  switch (sort) {
    case 'price-asc': orderBy = 'price ASC NULLS LAST, lastSeen DESC'; break;
    case 'price-desc': orderBy = 'price DESC NULLS LAST, lastSeen DESC'; break;
    case 'mileage-asc': orderBy = 'mileage ASC NULLS LAST, lastSeen DESC'; break;
    case 'year-desc': orderBy = 'year DESC NULLS LAST, lastSeen DESC'; break;
    case 'year-asc': orderBy = 'year ASC NULLS LAST, lastSeen DESC'; break;
    case 'recent': orderBy = 'lastSeen DESC'; break;
    default: break;
  }
  // sqlite supports NULLS LAST since 3.30; fall back to coalesce for older versions
  orderBy = orderBy.replace(/NULLS LAST/g, '');

  const sql = `SELECT * FROM listings ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${orderBy}`;
  const totalRow = db
    .prepare(`SELECT COUNT(*) as c FROM listings ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`)
    .get(...params);
  const total = totalRow.c;
  const totalAll = db.prepare('SELECT COUNT(*) as c FROM listings').get().c;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
  const offset = (pageNum - 1) * limitNum;

  const rows = db.prepare(`${sql} LIMIT ? OFFSET ?`).all(...params, limitNum, offset);
  const listings = rows.map(rowToListing);

  res.json({
    listings,
    page: pageNum,
    limit: limitNum,
    total,
    totalAll,
    hasMore: offset + listings.length < total,
    lastScrapeAt: parseInt(getMeta('lastScrapeAt') || '0', 10) || null,
  });
});

router.get('/:id', (req, res) => {
  const row = getDb().prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(rowToListing(row));
});

export default router;
