import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('super_admin', 'admin'));

router.get('/', reviewController.getAllReviewsAdmin);
router.put('/:id/approve', reviewController.approveReview);
router.put('/:id/disapprove', reviewController.disapproveReview);
router.delete('/:id', reviewController.deleteReview);

export default router;
