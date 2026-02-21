import { Router } from 'express';
import { fetchLiveInventory } from '../controllers/inventory.controller';

const router = Router();

router.get('/', fetchLiveInventory);

export default router;
