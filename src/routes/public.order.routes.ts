import { Router } from 'express';
import { submitSmartOrder } from '../controllers/order.controller';

const router = Router();

router.post('/', submitSmartOrder);

export default router;
