import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { reviewSubmissionRateLimit } from '../middleware/reviewRateLimit';

const router = Router();

router.post('/', reviewSubmissionRateLimit, reviewController.createReview);
router.get('/', reviewController.getApprovedReviews);
router.get('/summary', reviewController.getReviewSummary);
router.get('/stream', reviewController.streamReviewUpdates);

export default router;
