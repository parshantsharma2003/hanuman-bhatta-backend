import { Router } from 'express';
import { trackAnalyticsMetric } from '../controllers/analytics.controller';
import { analyticsRateLimit } from '../middleware/analyticsRateLimit';

const router = Router();

router.post('/track', analyticsRateLimit, trackAnalyticsMetric);

export default router;
