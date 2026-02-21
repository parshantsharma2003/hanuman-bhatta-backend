import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import {
  deleteAdminOrder,
  getAdminOrders,
  updateAdminOrder,
} from '../controllers/order.controller';

const router = Router();

router.use(authenticate);
router.get('/orders', authorizeRoles('super_admin', 'admin'), getAdminOrders);
router.patch('/orders/:id', authorizeRoles('super_admin', 'admin'), updateAdminOrder);
router.delete('/orders/:id', authorizeRoles('super_admin'), deleteAdminOrder);

export default router;
