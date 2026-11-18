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
      displayOrder: 1,
      createdAt: 1,
    });

    // Provide complete, clean product data for public catalog and order form
    const publicProducts = products.map((product) => ({
      _id: product._id,
      productId: product.productId,
      productCode: product.productCode,
      name: product.name,
      localName: product.localName,
      alternativeNames: product.alternativeNames || [],
      slug: product.slug,
      grade: product.grade || 'Grade 1',
      category: product.category,
      badge: product.badge,
      description: product.description,
      imageUrl: product.imageUrl,
      images: product.images || (product.imageUrl ? [product.imageUrl] : []),
      type: product.type,
      pricePerBrick: product.pricePerBrick || (product.pricePer1000 ? Math.round((product.pricePer1000 / 1000) * 100) / 100 : 9),
      pricePer1000: product.pricePer1000,
      pricePerTrolley: product.pricePerTrolley,
      pricingUnit: product.pricingUnit || 'INR',
      characteristics: product.characteristics || [],
      recommendedApplications: product.recommendedApplications || [],
      colourDescription: product.colourDescription,
      soundDescription: product.soundDescription,
      strengthLevel: product.strengthLevel,
      usageTags: product.usageTags || [],
      qualityGrade: product.qualityGrade,
      availabilityStatus: product.availabilityStatus || 'In Stock',
      availability: product.availability,
      isActive: product.isActive,
      isFeatured: product.isFeatured || false,
      displayOrder: product.displayOrder || 0,
      stockQuantity: product.stockQuantity || 0,
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
      productId,
      productCode,
      name,
      localName,
      alternativeNames,
      slug,
      grade,
      category,
      badge,
      description,
      type,
      pricePerBrick,
      pricePer1000,
      pricePerTrolley,
      characteristics,
      recommendedApplications,
      colourDescription,
      soundDescription,
      strengthLevel,
      usageTags,
      qualityGrade,
      isActive,
      isFeatured,
      displayOrder,
      stockQuantity,
      availabilityStatus,
      imageData,
    } = req.body;

    const resolvedPricePer1000 =
      pricePer1000 !== undefined
        ? Number(pricePer1000)
        : pricePerBrick !== undefined
        ? Math.round(Number(pricePerBrick) * 1000)
        : 9000;

    const resolvedPricePerBrick =
      pricePerBrick !== undefined
        ? Number(pricePerBrick)
        : Math.round((resolvedPricePer1000 / 1000) * 100) / 100;

    const resolvedPricePerTrolley =
      pricePerTrolley !== undefined ? Number(pricePerTrolley) : resolvedPricePer1000 * 3;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Product name is required',
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
      productId: productId || undefined,
      productCode: productCode || undefined,
      name,
      localName,
      alternativeNames: alternativeNames || [],
      slug,
      grade: grade || 'Grade 1',
      category: category || 'Standard Quality',
      badge: badge || '',
      description,
      imageUrl,
      imagePublicId,
      images: imageUrl ? [imageUrl] : [],
      type: type || 'Class 105 Structural Masonry',
      pricePerBrick: resolvedPricePerBrick,
      pricePer1000: resolvedPricePer1000,
      pricePerTrolley: resolvedPricePerTrolley,
      characteristics: characteristics || [],
      recommendedApplications: recommendedApplications || [],
      colourDescription: colourDescription || '',
      soundDescription: soundDescription || '',
      strengthLevel: strengthLevel || '',
      usageTags: usageTags || [],
      qualityGrade: qualityGrade || 'First',
      isActive: isActive !== undefined ? isActive : true,
      availability: isActive !== undefined ? isActive : true,
      isFeatured: Boolean(isFeatured),
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
      availabilityStatus: availabilityStatus || 'In Stock',
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
      productId,
      productCode,
      name,
      localName,
      alternativeNames,
      slug,
      grade,
      category,
      badge,
      description,
      type,
      pricePerBrick,
      pricePer1000,
      pricePerTrolley,
      characteristics,
      recommendedApplications,
      colourDescription,
      soundDescription,
      strengthLevel,
      usageTags,
      qualityGrade,
      isActive,
      isFeatured,
      displayOrder,
      stockQuantity,
      availabilityStatus,
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

    const previousPricePerBrick = (product as any).pricePerBrick;
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
    if (productId !== undefined) (product as any).productId = productId;
    if (productCode !== undefined) (product as any).productCode = productCode;
    if (name !== undefined) product.name = name;
    if (localName !== undefined) (product as any).localName = localName;
    if (alternativeNames !== undefined) (product as any).alternativeNames = alternativeNames;
    if (slug !== undefined) product.slug = slug;
    if (grade !== undefined) (product as any).grade = grade;
    if (category !== undefined) (product as any).category = category;
    if (badge !== undefined) (product as any).badge = badge;
    if (description !== undefined) product.description = description;
    if (type !== undefined) product.type = type;

    if (pricePerBrick !== undefined) {
      (product as any).pricePerBrick = Number(pricePerBrick);
      if (pricePer1000 === undefined) {
        product.pricePer1000 = Math.round(Number(pricePerBrick) * 1000);
      }
    }

    if (pricePer1000 !== undefined) {
      product.pricePer1000 = Number(pricePer1000);
      if (pricePerBrick === undefined) {
        (product as any).pricePerBrick = Math.round((Number(pricePer1000) / 1000) * 100) / 100;
      }
    }

    if (pricePerTrolley !== undefined) {
      product.pricePerTrolley = Number(pricePerTrolley);
    } else if (pricePer1000 !== undefined) {
      product.pricePerTrolley = product.pricePer1000 * 3;
    }

    if (characteristics !== undefined) (product as any).characteristics = characteristics;
    if (recommendedApplications !== undefined) (product as any).recommendedApplications = recommendedApplications;
    if (colourDescription !== undefined) (product as any).colourDescription = colourDescription;
    if (soundDescription !== undefined) (product as any).soundDescription = soundDescription;
    if (strengthLevel !== undefined) (product as any).strengthLevel = strengthLevel;
    if (usageTags !== undefined) product.usageTags = usageTags;
    if (qualityGrade !== undefined) product.qualityGrade = qualityGrade;
    if (isActive !== undefined) {
      product.isActive = isActive;
      product.availability = isActive;
    }
    if (isFeatured !== undefined) (product as any).isFeatured = Boolean(isFeatured);
    if (displayOrder !== undefined) (product as any).displayOrder = Number(displayOrder);
    if (stockQuantity !== undefined) (product as any).stockQuantity = Number(stockQuantity);
    if (availabilityStatus !== undefined) (product as any).availabilityStatus = availabilityStatus;

    await product.save();

    const isPriceChanged =
      previousPricePer1000 !== product.pricePer1000 ||
      previousPricePerTrolley !== product.pricePerTrolley ||
      previousPricePerBrick !== (product as any).pricePerBrick;
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

  try {
    res.write('data: {"type":"connected"}\n\n');
  } catch {
    return;
  }

  const heartbeat = setInterval(() => {
    if (res.writableEnded || res.destroyed) {
      clearInterval(heartbeat);
      return;
    }

    try {
      res.write('data: {"type":"heartbeat"}\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    res.end();
  });
};

// Legacy export for backward compatibility
export const fetchAllProducts = getAllProductsPublic;
