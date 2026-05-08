import dotenv from 'dotenv';
import { initDb } from '../db.js';
import { runAllScrapers } from '../scrapers/runner.js';

dotenv.config();
initDb();
runAllScrapers({ trigger: 'cli', force: true })
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
