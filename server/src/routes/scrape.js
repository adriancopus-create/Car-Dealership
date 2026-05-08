import { Router } from 'express';
import { runAllScrapers } from '../scrapers/runner.js';

const router = Router();

router.post('/refresh', async (req, res, next) => {
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    const result = await runAllScrapers({ trigger: 'api', force });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
