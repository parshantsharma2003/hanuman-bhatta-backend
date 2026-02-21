import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import * as adminService from '../services/admin.service';
import Product from '../models/Product';
import { listRecentActivity, logActivity } from '../services/activityLog.service';

export const updateProductPricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { pricePer1000, pricePerTrolley, availability } = req.body || {};

    // Validate product ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid product ID is required', 400);
    }

    // Validate pricing fields
    if (typeof pricePer1000 !== 'number' || pricePer1000 < 0) {
      throw new AppError('Price per 1000 must be a positive number', 400);
    }

    if (typeof pricePerTrolley !== 'number' || pricePerTrolley < 0) {
      throw new AppError('Price per trolley must be a positive number', 400);
    }

    if (availability !== undefined && typeof availability !== 'boolean') {
      throw new AppError('Availability must be a boolean value', 400);
    }

    const existingProduct = await Product.findById(id)
      .select('name pricePer1000 pricePerTrolley')
      .exec();

    if (!existingProduct) {
      throw new AppError('Product not found or already deleted', 404);
    }

    const updated = await adminService.updateProductPricing(id, {
      pricePer1000,
      pricePerTrolley,
      availability,
    });

    const isPriceChanged =
      existingProduct.pricePer1000 !== pricePer1000 ||
      existingProduct.pricePerTrolley !== pricePerTrolley;

    if (isPriceChanged && updated) {
      await logActivity({
        actionType: 'price_change',
        entityType: 'product',
        entityId: id,
        message: 'Price updated',
        actorId: req.user?.id,
        actorName: req.user?.name || 'Admin',
        actorRole: req.user?.role || 'admin',
        metadata: {
          productName: existingProduct.name,
          previous: {
            pricePer1000: existingProduct.pricePer1000,
            pricePerTrolley: existingProduct.pricePerTrolley,
          },
          next: {
            pricePer1000,
            pricePerTrolley,
          },
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product pricing updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { totalBricks, availableTrolleys } = req.body || {};

    // Validate inventory fields
    if (typeof totalBricks !== 'number' || totalBricks < 0 || !Number.isInteger(totalBricks)) {
      throw new AppError('Total bricks must be a positive whole number', 400);
    }

    if (typeof availableTrolleys !== 'number' || availableTrolleys < 0 || !Number.isInteger(availableTrolleys)) {
      throw new AppError('Available trolleys must be a positive whole number', 400);
    }

    const previousInventory = await adminService.getLatestInventorySnapshot();

    const updated = await adminService.upsertInventory({
      totalBricks,
      availableTrolleys,
    });

    await logActivity({
      actionType: 'inventory_update',
      entityType: 'inventory',
      entityId: updated?._id ? String((updated as any)._id) : undefined,
      message: 'Inventory updated',
      actorId: req.user?.id,
      actorName: req.user?.name || 'Admin',
      actorRole: req.user?.role || 'admin',
      metadata: {
        previous: previousInventory
          ? {
              totalBricks: previousInventory.totalBricks,
              availableTrolleys: previousInventory.availableTrolleys,
            }
          : null,
        next: {
          totalBricks,
          availableTrolleys,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit;
    const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 100;

    const enquiries = await adminService.listEnquiries(Number.isNaN(limit) ? 100 : limit);

    res.status(200).json({
      success: true,
      data: enquiries,
      count: enquiries.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit;
    const limit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 20;

    const orders = await adminService.listOrders(Number.isNaN(limit) ? 20 : limit);

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate product ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid product ID is required', 400);
    }

    const deleted = await adminService.deleteProductById(id);

    if (!deleted) {
      throw new AppError('Product not found or already deleted', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate order ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid order ID is required', 400);
    }

    const deleted = await adminService.deleteOrderById(id);

    if (!deleted) {
      throw new AppError('Order not found or already deleted', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

// Create Product
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, type, pricePer1000, pricePerTrolley, availability } = req.body || {};

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new AppError('Product name must be at least 2 characters', 400);
    }

    if (!type || typeof type !== 'string' || type.trim().length < 2) {
      throw new AppError('Product type must be at least 2 characters', 400);
    }

    if (typeof pricePer1000 !== 'number' || pricePer1000 < 0) {
      throw new AppError('Price per 1000 must be a positive number', 400);
    }

    if (typeof pricePerTrolley !== 'number' || pricePerTrolley < 0) {
      throw new AppError('Price per trolley must be a positive number', 400);
    }

    const product = await adminService.createProduct({
      name: name.trim(),
      type: type.trim(),
      pricePer1000,
      pricePerTrolley,
      availability,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Products (Admin View)
export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await adminService.getAllProducts();

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    next(error);
  }
};

// Update Enquiry
export const updateEnquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    // Validate enquiry ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid enquiry ID is required', 400);
    }

    const updated = await adminService.updateEnquiryById(id, { status, notes });

    if (!updated) {
      throw new AppError('Enquiry not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Enquiry
export const deleteEnquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Validate enquiry ID format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid enquiry ID is required', 400);
    }

    const deleted = await adminService.deleteEnquiryById(id);

    if (!deleted) {
      throw new AppError('Enquiry not found or already deleted', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

// Get Dashboard Statistics
export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitParam = req.query.limit;
    const parsedLimit = typeof limitParam === 'string' ? parseInt(limitParam, 10) : 30;
    const limit = Number.isNaN(parsedLimit) ? 30 : parsedLimit;

    const logs = await listRecentActivity(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
