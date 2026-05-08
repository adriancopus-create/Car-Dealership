import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

let db;

export function getDb() {
  if (!db) initDb();
  return db;
}

export function initDb() {
  const dbPath = process.env.DB_PATH || './data/autogrid.db';
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      fingerprint TEXT NOT NULL,
      title TEXT,
      price REAL,
      mileage INTEGER,
      year INTEGER,
      make TEXT,
      model TEXT,
      trim TEXT,
      bodyStyle TEXT,
      transmission TEXT,
      fuelType TEXT,
      drivetrain TEXT,
      exteriorColor TEXT,
      interiorColor TEXT,
      engine TEXT,
      mpgCity INTEGER,
      mpgHighway INTEGER,
      vin TEXT,
      location TEXT,
      dealerName TEXT,
      dealerPhone TEXT,
      description TEXT,
      imageUrl TEXT,
      images TEXT,        -- JSON array
      sources TEXT,       -- JSON array of {site, url, listingId, price}
      firstSeen INTEGER,
      lastSeen INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_listings_fp ON listings(fingerprint);
    CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
    CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
    CREATE INDEX IF NOT EXISTS idx_listings_make ON listings(make);

    CREATE TABLE IF NOT EXISTS scrape_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT,
      startedAt INTEGER,
      finishedAt INTEGER,
      status TEXT,        -- 'ok' | 'blocked' | 'error'
      count INTEGER,
      message TEXT
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export function setMeta(key, value) {
  getDb()
    .prepare('INSERT OR REPLACE INTO meta(key, value) VALUES(?, ?)')
    .run(key, String(value));
}

export function getMeta(key) {
  const row = getDb().prepare('SELECT value FROM meta WHERE key = ?').get(key);
  return row ? row.value : null;
}
