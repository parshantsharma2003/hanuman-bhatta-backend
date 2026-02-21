import { Router } from 'express';
import { getAllGalleryPublic, galleryStream } from '../controllers/gallery.controller';

const router = Router();

// @route   GET /api/v1/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', getAllGalleryPublic);

// @route   GET /api/v1/gallery/stream
// @desc    SSE endpoint for real-time gallery updates
// @access  Public
router.get('/stream', galleryStream);

export default router;
