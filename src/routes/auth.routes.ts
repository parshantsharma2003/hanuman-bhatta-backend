import { Router } from 'express';
import { loginAdmin, logoutAdmin, getAdminProfile } from '../controllers/auth.controller';
import { authenticate, authenticateOptional } from '../middleware/auth';

const router = Router();

router.post('/login', loginAdmin);
router.post('/logout', authenticate, logoutAdmin);
router.get('/me', authenticateOptional, getAdminProfile);

export default router;
