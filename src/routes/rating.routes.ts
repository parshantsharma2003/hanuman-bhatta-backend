import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/summary', reviewController.getRatingSummaryLegacy);
router.post('/submit', reviewController.submitReviewLegacy);

// Admin routes (protected)
router.get('/admin/pending', authenticate, requireAdmin, reviewController.getAllReviewsAdmin);
router.patch('/admin/:id/approve', authenticate, requireAdmin, reviewController.approveReview);
router.delete('/admin/:id', authenticate, requireAdmin, reviewController.deleteReview);
router.get('/admin/approved', authenticate, requireAdmin, reviewController.getApprovedReviews);

export default router;
