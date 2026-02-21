import { Router } from 'express';
import healthRoutes from './health.routes';
import productRoutes from './product.routes';
import inventoryRoutes from './inventory.routes';
import enquiryRoutes from './enquiry.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import galleryRoutes from './gallery.routes';
import publicAnalyticsRoutes from './public.analytics.routes';
import adminAnalyticsRoutes from './admin.analytics.routes';
import publicOrderRoutes from './public.order.routes';
import adminOrderRoutes from './admin.order.routes';
import ratingRoutes from './rating.routes';
import publicReviewRoutes from './public.review.routes';
import adminReviewRoutes from './admin.review.routes';
import { env } from '../config/env';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// Product routes
router.use('/products', productRoutes);

// Inventory routes
router.use('/inventory', inventoryRoutes);

// Enquiry routes
router.use('/enquiries', enquiryRoutes);

// Gallery routes
router.use('/gallery', galleryRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Public analytics tracking routes
router.use('/analytics', publicAnalyticsRoutes);

// Public order routes
router.use('/orders', publicOrderRoutes);

// Public reviews routes
router.use('/reviews', publicReviewRoutes);

// Public ratings routes
router.use('/ratings', ratingRoutes);

// Admin routes (protected)
router.use('/admin', adminRoutes);
router.use('/admin', adminAnalyticsRoutes);
router.use('/admin', adminOrderRoutes);
router.use('/admin/reviews', adminReviewRoutes);

// API info route
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Hanuman Bhatta API',
    version: env.apiVersion,
    endpoints: {
      health: '/health',
      ping: '/health/ping',
      products: '/products',
      inventory: '/inventory',
      enquiries: '/enquiries',
      gallery: '/gallery',
      analyticsTrack: '/analytics/track',
      orders: '/orders',
      auth: '/auth',
      admin: '/admin',
      adminAnalytics: '/admin/analytics',
      adminOrders: '/admin/orders',
      reviews: '/reviews',
      adminReviews: '/admin/reviews',
    },
  });
});

export default router;
