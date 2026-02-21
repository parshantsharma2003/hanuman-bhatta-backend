import { Request, Response } from 'express';
import Product from '../models/Product';
import { uploadImage, deleteMedia } from '../config/cloudinary';
import { logActivity } from '../services/activityLog.service';

// @desc    Get all products (Admin)
// @route   GET /api/v1/admin/products
// @access  Private (Super Admin / Admin)
export const getAllProductsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const query = includeArchived ? {} : { isArchived: { $ne: true } };
    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// @desc    Get all active products (Public)
// @route   GET /api/v1/products
// @access  Public
export const getAllProductsPublic = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true, isArchived: { $ne: true } }).sort({
      createdAt: -1,
    });

    // Optimize response for public (remove admin-only fields)
    const publicProducts = products.map((product) => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: product.imageUrl,
      type: product.type,
      pricePer1000: product.pricePer1000,
      pricePerTrolley: product.pricePerTrolley,
      usageTags: product.usageTags,
      qualityGrade: product.qualityGrade,
      availability: product.availability,
    }));

    res.status(200).json({
      success: true,
      count: publicProducts.length,
      data: publicProducts,
    });
  } catch (error: any) {
    console.error('Get public products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/admin/products/:id
// @access  Private (Super Admin / Admin)
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

// @desc    Create new product
// @route   POST /api/v1/admin/products
// @access  Private (Super Admin / Admin)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      type,
      pricePer1000,
      pricePerTrolley,
      usageTags,
      qualityGrade,
      isActive,
      imageData,
    } = req.body;

    // Validate required fields
    if (!name || !type || !pricePer1000 || !pricePerTrolley || !qualityGrade) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Check if slug already exists
    if (slug) {
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        res.status(400).json({
          success: false,
          message: 'Product with this slug already exists',
        });
        return;
      }
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    // Upload image to Cloudinary if provided
    if (imageData) {
      try {
        const uploadResult = await uploadImage(imageData);
        imageUrl = uploadResult.mediaUrl;
        imagePublicId = uploadResult.publicId;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        res.status(400).json({
          success: false,
          message: 'Failed to upload product image',
        });
        return;
      }
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      imageUrl,
      imagePublicId,
      type,
      pricePer1000,
      pricePerTrolley,
      usageTags: usageTags || [],
      qualityGrade,
      isActive: isActive !== undefined ? isActive : true,
      availability: isActive !== undefined ? isActive : true,
      isArchived: false,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/v1/admin/products/:id
// @access  Private (Super Admin / Admin)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      type,
      pricePer1000,
      pricePerTrolley,
      usageTags,
      qualityGrade,
      isActive,
      imageData,
      removeImage,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.isArchived) {
      res.status(400).json({
        success: false,
        message: 'Archived product cannot be edited. Restore it first.',
      });
      return;
    }

    const previousPricePer1000 = product.pricePer1000;
    const previousPricePerTrolley = product.pricePerTrolley;

    // Check slug uniqueness if changed
    if (slug && slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        res.status(400).json({
          success: false,
          message: 'Product with this slug already exists',
        });
        return;
      }
    }

    // Handle image removal
    if (removeImage && product.imagePublicId) {
      try {
        await deleteMedia(product.imagePublicId, 'image');
        product.imageUrl = undefined;
        product.imagePublicId = undefined;
      } catch (deleteError) {
        console.error('Image deletion error:', deleteError);
      }
    }

    // Handle new image upload
    if (imageData) {
      // Delete old image first if exists
      if (product.imagePublicId) {
        try {
          await deleteMedia(product.imagePublicId, 'image');
        } catch (deleteError) {
          console.error('Old image deletion error:', deleteError);
        }
      }

      // Upload new image
      try {
        const uploadResult = await uploadImage(imageData);
        product.imageUrl = uploadResult.mediaUrl;
        product.imagePublicId = uploadResult.publicId;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        res.status(400).json({
          success: false,
          message: 'Failed to upload product image',
        });
        return;
      }
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (slug !== undefined) product.slug = slug;
    if (description !== undefined) product.description = description;
    if (type !== undefined) product.type = type;
    if (pricePer1000 !== undefined) product.pricePer1000 = pricePer1000;
    if (pricePerTrolley !== undefined) product.pricePerTrolley = pricePerTrolley;
    if (usageTags !== undefined) product.usageTags = usageTags;
    if (qualityGrade !== undefined) product.qualityGrade = qualityGrade;
    if (isActive !== undefined) {
      product.isActive = isActive;
      product.availability = isActive;
    }

    await product.save();

    const isPriceChanged =
      previousPricePer1000 !== product.pricePer1000 ||
      previousPricePerTrolley !== product.pricePerTrolley;

    if (isPriceChanged) {
      await logActivity({
        actionType: 'price_change',
        entityType: 'product',
        entityId: String(product._id),
        message: 'Price updated',
        actorId: req.user?.id,
        actorName: req.user?.name || 'Admin',
        actorRole: req.user?.role || 'admin',
        metadata: {
          productName: product.name,
          previous: {
            pricePer1000: previousPricePer1000,
            pricePerTrolley: previousPricePerTrolley,
          },
          next: {
            pricePer1000: product.pricePer1000,
            pricePerTrolley: product.pricePerTrolley,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

// @desc    Archive product (soft delete)
// @route   DELETE /api/v1/admin/products/:id
// @access  Private (Super Admin / Admin)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.isArchived) {
      res.status(400).json({
        success: false,
        message: 'Product is already archived',
      });
      return;
    }

    product.isArchived = true;
    product.archivedAt = new Date();
    product.archivedBy = req.user?.id;
    product.isActive = false;
    product.availability = false;

    await product.save();

    await logActivity({
      actionType: 'product_archived',
      entityType: 'product',
      entityId: String(product._id),
      message: 'Product archived',
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      actorRole: req.user?.role || 'admin',
      metadata: {
        productName: product.name,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product archived successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
};

// @desc    Restore archived product
// @route   PATCH /api/v1/admin/products/:id/restore
// @access  Private (Super Admin / Admin)
export const restoreProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (!product.isArchived) {
      res.status(400).json({
        success: false,
        message: 'Product is not archived',
      });
      return;
    }

    product.isArchived = false;
    product.archivedAt = undefined;
    product.archivedBy = undefined;

    await product.save();

    await logActivity({
      actionType: 'product_restored',
      entityType: 'product',
      entityId: String(product._id),
      message: 'Product restored',
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      actorRole: req.user?.role || 'admin',
      metadata: {
        productName: product.name,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Product restored successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Restore product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore product',
    });
  }
};

// @desc    Toggle product active status
// @route   PATCH /api/v1/admin/products/:id/toggle-active
// @access  Private (Super Admin / Admin)
export const toggleProductActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    if (product.isArchived) {
      res.status(400).json({
        success: false,
        message: 'Archived product cannot be activated. Restore it first.',
      });
      return;
    }

    product.isActive = !product.isActive;
    product.availability = product.isActive;

    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: product,
    });
  } catch (error: any) {
    console.error('Toggle product active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product status',
    });
  }
};

// @desc    Product SSE endpoint for real-time updates
// @route   GET /api/v1/products/stream
// @access  Public
export const productStream = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write('data: {"type":"connected"}\n\n');

  const heartbeat = setInterval(() => {
    res.write('data: {"type":"heartbeat"}\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    res.end();
  });
};

// Legacy export for backward compatibility
export const fetchAllProducts = getAllProductsPublic;
