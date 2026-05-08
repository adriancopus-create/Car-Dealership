import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { initDb } from './db.js';
import listingsRouter from './routes/listings.js';
import filtersRouter from './routes/filters.js';
import scrapeRouter from './routes/scrape.js';
import { runAllScrapers, scheduleScraping } from './scrapers/runner.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '4000', 10);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

initDb();

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/listings', listingsRouter);
app.use('/api/filters', filtersRouter);
app.use('/api/scrape', scrapeRouter);

app.use((err, _req, res, _next) => {
  console.error('[autogrid] unhandled error', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[autogrid] api listening on http://localhost:${PORT}`);
  if (process.env.SCRAPE_ON_START !== 'false') {
    runAllScrapers({ trigger: 'startup' }).catch((err) =>
      console.error('[autogrid] startup scrape failed', err),
    );
  }
  scheduleScraping();
});
