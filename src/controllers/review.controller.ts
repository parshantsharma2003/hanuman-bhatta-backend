import { Request, Response } from 'express';
import { Review } from '../models';

const reviewClients = new Set<Response>();

const approvedFilter = {
  $or: [{ status: 'approved' }, { status: { $exists: false }, isApproved: true }],
};

const sanitizeText = (value: unknown, maxLength: number): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
};

const mapReview = (review: any) => ({
  _id: review._id,
  rating: review.rating,
  comment: review.comment,
  name: review.name,
  location: review.location,
  status:
    review.status || (review.isApproved ? 'approved' : 'pending'),
  createdAt: review.createdAt,
});

const getSummary = async () => {
  const approvedReviews = await Review.find(approvedFilter).select('rating').lean();

  if (!approvedReviews.length) {
    return {
      averageRating: 0,
      totalApprovedReviews: 0,
    };
  }

  const totalRating = approvedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);

  return {
    averageRating: Number((totalRating / approvedReviews.length).toFixed(1)),
    totalApprovedReviews: approvedReviews.length,
  };
};

const broadcastReviewUpdate = async (eventType: 'review_updated' | 'review_deleted' = 'review_updated') => {
  if (!reviewClients.size) return;

  const summary = await getSummary();
  const payload = JSON.stringify({
    eventType,
    summary,
    timestamp: new Date().toISOString(),
  });

  reviewClients.forEach((client) => {
    client.write(`event: ${eventType}\n`);
    client.write(`data: ${payload}\n\n`);
  });
};

export const reviewController = {
  createReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const rating = Number(req.body?.rating);
      const comment = sanitizeText(req.body?.comment, 300);
      const name = sanitizeText(req.body?.name, 80);
      const location = sanitizeText(req.body?.location, 120);

      if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }

      if (!comment) {
        res.status(400).json({
          success: false,
          message: 'Review text is required',
        });
        return;
      }

      const review = await Review.create({
        rating,
        comment,
        name: name || undefined,
        location: location || undefined,
        status: 'pending',
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully and is pending approval',
        data: mapReview(review),
      });
    } catch (error) {
      console.error('[ReviewController] createReview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit review',
      });
    }
  },

  getApprovedReviews: async (_req: Request, res: Response): Promise<void> => {
    try {
      const reviews = await Review.find(approvedFilter)
        .sort({ createdAt: -1 })
        .select('rating comment name location status createdAt isApproved')
        .lean();

      res.status(200).json({
        success: true,
        data: reviews.map(mapReview),
        count: reviews.length,
      });
    } catch (error) {
      console.error('[ReviewController] getApprovedReviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
      });
    }
  },

  getReviewSummary: async (_req: Request, res: Response): Promise<void> => {
    try {
      const summary = await getSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('[ReviewController] getReviewSummary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review summary',
      });
    }
  },

  streamReviewUpdates: async (_req: Request, res: Response): Promise<void> => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    reviewClients.add(res);

    const summary = await getSummary();
    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ summary, timestamp: new Date().toISOString() })}\n\n`);

    const heartbeat = setInterval(() => {
      res.write(': ping\n\n');
    }, 25000);

    res.on('close', () => {
      clearInterval(heartbeat);
      reviewClients.delete(res);
    });
  },

  getAllReviewsAdmin: async (_req: Request, res: Response): Promise<void> => {
    try {
      const reviews = await Review.find({})
        .sort({ createdAt: -1 })
        .select('rating comment name location status createdAt isApproved')
        .lean();

      res.status(200).json({
        success: true,
        data: reviews.map(mapReview),
        count: reviews.length,
      });
    } catch (error) {
      console.error('[ReviewController] getAllReviewsAdmin error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
      });
    }
  },

  approveReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const review = await Review.findByIdAndUpdate(
        id,
        { status: 'approved', isApproved: true },
        { new: true }
      );

      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      await broadcastReviewUpdate('review_updated');

      res.status(200).json({
        success: true,
        message: 'Review approved',
        data: mapReview(review),
      });
    } catch (error) {
      console.error('[ReviewController] approveReview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve review',
      });
    }
  },

  disapproveReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const review = await Review.findByIdAndUpdate(
        id,
        { status: 'pending', isApproved: false },
        { new: true }
      );

      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      await broadcastReviewUpdate('review_updated');

      res.status(200).json({
        success: true,
        message: 'Review moved to pending',
        data: mapReview(review),
      });
    } catch (error) {
      console.error('[ReviewController] disapproveReview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review',
      });
    }
  },

  deleteReview: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const review = await Review.findByIdAndDelete(id);

      if (!review) {
        res.status(404).json({ success: false, message: 'Review not found' });
        return;
      }

      await broadcastReviewUpdate('review_deleted');

      res.status(200).json({
        success: true,
        message: 'Review deleted',
      });
    } catch (error) {
      console.error('[ReviewController] deleteReview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
      });
    }
  },

  // Backward-compat wrappers for legacy /ratings endpoints
  getRatingSummaryLegacy: async (req: Request, res: Response) => {
    await reviewController.getReviewSummary(req, res);
  },
  submitReviewLegacy: async (req: Request, res: Response) => {
    if (req.body && typeof req.body.comment !== 'string' && typeof req.body.phoneNumber === 'string') {
      req.body.name = req.body.phoneNumber;
      req.body.comment = 'Local customer feedback';
    }
    await reviewController.createReview(req, res);
  },
};
