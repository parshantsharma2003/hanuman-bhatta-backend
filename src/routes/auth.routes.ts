import { Router } from 'express';
import { loginAdmin, logoutAdmin, getAdminProfile } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', loginAdmin);
router.post('/logout', authenticate, logoutAdmin);
router.get('/me', authenticate, getAdminProfile);

export default router;
