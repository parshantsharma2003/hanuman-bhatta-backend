import { Request, Response } from 'express';
import { Review } from '../models';

export const ratingController = {
  /**
   * GET /api/v1/ratings/summary
   * Public endpoint - Get rating summary (average rating, total reviews)
   */
  getRatingSummary: async (_req: Request, res: Response): Promise<void> => {
    try {
      // Get approved reviews only
      const approvedReviews = await Review.find({ isApproved: true });

      if (approvedReviews.length === 0) {
        res.status(200).json({
          success: true,
          data: {
            totalReviews: 0,
            averageRating: 0,
            lastUpdated: new Date(),
          },
        });
        return;
      }

      // Calculate average rating
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = parseFloat((totalRating / approvedReviews.length).toFixed(1));

      res.status(200).json({
        success: true,
        data: {
          totalReviews: approvedReviews.length,
          averageRating,
          lastUpdated: new Date(),
        },
      });
    } catch (error: any) {
      console.error('[RatingController] Error fetching rating summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rating summary',
      });
    }
  },

  /**
   * POST /api/v1/ratings/submit
   * Public endpoint - Submit a review
   */
  submitReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { rating, comment, phoneNumber, location } = req.body;

      // Validation
      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }

      // Create review
      const review = new Review({
        rating,
        comment: comment?.trim() || undefined,
        phoneNumber: phoneNumber?.trim() || undefined,
        location: location?.trim() || undefined,
        isApproved: false, // Requires admin approval
      });

      await review.save();

      res.status(201).json({
        success: true,
        message: 'Thank you! Your review has been submitted and will be visible after approval.',
        data: review,
      });
    } catch (error: any) {
      console.error('[RatingController] Error submitting review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit review',
      });
    }
  },

  /**
   * GET /api/v1/admin/ratings/pending
   * Admin endpoint - Get pending reviews for approval
   */
  getPendingReviews: async (_req: Request, res: Response): Promise<void> => {
    try {
      const reviews = await Review.find({ isApproved: false }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: reviews,
        count: reviews.length,
      });
    } catch (error: any) {
      console.error('[RatingController] Error fetching pending reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending reviews',
      });
    }
  },

  /**
   * PATCH /api/v1/admin/ratings/:id/approve
   * Admin endpoint - Approve a review
   */
  approveReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const review = await Review.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
      );

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review approved',
        data: review,
      });
    } catch (error: any) {
      console.error('[RatingController] Error approving review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve review',
      });
    }
  },

  /**
   * DELETE /api/v1/admin/ratings/:id
   * Admin endpoint - Delete/reject a review
   */
  deleteReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const review = await Review.findByIdAndDelete(id);

      if (!review) {
        res.status(404).json({
          success: false,
          message: 'Review not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Review deleted',
        data: review,
      });
    } catch (error: any) {
      console.error('[RatingController] Error deleting review:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
      });
    }
  },

  /**
   * GET /api/v1/admin/ratings/approved
   * Admin endpoint - Get all approved reviews
   */
  getApprovedReviews: async (_req: Request, res: Response): Promise<void> => {
    try {
      const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: reviews,
        count: reviews.length,
      });
    } catch (error: any) {
      console.error('[RatingController] Error fetching approved reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch approved reviews',
      });
    }
  },
};
