import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analytics.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/analytics', authorizeRoles('super_admin', 'admin'), getAdminAnalytics);

export default router;
