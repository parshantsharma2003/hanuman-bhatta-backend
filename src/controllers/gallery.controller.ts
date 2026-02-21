import { Request, Response } from 'express';
import Gallery from '../models/Gallery';
import { uploadImage, uploadVideo, deleteMedia } from '../config/cloudinary';

// @desc    Upload gallery media (Admin only)
// @route   POST /api/v1/admin/gallery
// @access  Private (Super Admin / Admin)
export const uploadGalleryMedia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, title, description, fileData } = req.body;

    if (!type || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Media type and file data are required',
      });
    }

    if (!['image', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid media type. Must be "image" or "video"',
      });
    }

    // Upload to Cloudinary
    let uploadResult;
    if (type === 'image') {
      uploadResult = await uploadImage(fileData);
    } else {
      uploadResult = await uploadVideo(fileData);
    }

    // Save to database
    const galleryItem = await Gallery.create({
      type,
      title: title || undefined,
      description: description || undefined,
      mediaUrl: uploadResult.mediaUrl,
      publicId: uploadResult.publicId,
    });

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: galleryItem,
    });
  } catch (error: any) {
    console.error('Upload gallery media error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload media',
    });
  }
};

// @desc    Get all gallery items (Admin)
// @route   GET /api/v1/admin/gallery
// @access  Private (Super Admin / Admin)
export const getAllGalleryAdmin = async (_req: Request, res: Response): Promise<any> => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems,
    });
  } catch (error: any) {
    console.error('Get gallery items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items',
    });
  }
};

// @desc    Get all gallery items (Public)
// @route   GET /api/v1/gallery
// @access  Public
export const getAllGalleryPublic = async (_req: Request, res: Response): Promise<any> => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems,
    });
  } catch (error: any) {
    console.error('Get gallery items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery items',
    });
  }
};

// @desc    Update gallery item metadata
// @route   PUT /api/v1/admin/gallery/:id
// @access  Private (Super Admin / Admin)
export const updateGalleryItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const galleryItem = await Gallery.findById(id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      });
    }

    if (title !== undefined) galleryItem.title = title;
    if (description !== undefined) galleryItem.description = description;

    await galleryItem.save();

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem,
    });
  } catch (error: any) {
    console.error('Update gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery item',
    });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/v1/admin/gallery/:id
// @access  Private (Super Admin / Admin)
export const deleteGalleryItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const galleryItem = await Gallery.findById(id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      });
    }

    // Delete from Cloudinary
    await deleteMedia(galleryItem.publicId, galleryItem.type);

    // Delete from database
    await Gallery.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete gallery item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery item',
    });
  }
};

// @desc    Gallery SSE endpoint for real-time updates
// @route   GET /api/v1/gallery/stream
// @access  Public
export const galleryStream = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message
  res.write('data: {"type":"connected"}\n\n');

  // Keep connection alive with heartbeat
  const heartbeat = setInterval(() => {
    res.write('data: {"type":"heartbeat"}\n\n');
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    res.end();
  });
};

// Helper function to notify all SSE clients (to be called after CRUD operations)
export const notifyGalleryUpdate = (type: 'added' | 'updated' | 'deleted', data?: any) => {
  // This will be implemented with a simple event emitter or in-memory store
  // For now, clients will poll or use websockets
  console.log(`Gallery update: ${type}`, data);
};
