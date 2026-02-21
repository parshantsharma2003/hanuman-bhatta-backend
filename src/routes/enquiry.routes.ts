import { Router } from 'express';
import { submitEnquiry } from '../controllers/enquiry.controller';

const router = Router();

router.post('/', submitEnquiry);

export default router;
