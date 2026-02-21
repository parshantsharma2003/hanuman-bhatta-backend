import { Router } from 'express';
import { getAllProductsPublic, productStream } from '../controllers/product.controller';

const router = Router();

// @route   GET /api/v1/products
// @desc    Get all active products
// @access  Public
router.get('/', getAllProductsPublic);

// @route   GET /api/v1/products/stream
// @desc    SSE endpoint for real-time product updates
// @access  Public
router.get('/stream', productStream);

export default router;
