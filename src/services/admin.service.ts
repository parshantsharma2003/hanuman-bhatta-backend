import Product, { ProductDocument } from '../models/Product';
import Inventory, { InventoryDocument } from '../models/Inventory';
import Enquiry from '../models/Enquiry';
import Order, { OrderDocument } from '../models/Order';

export interface UpdateProductPricingInput {
  pricePer1000: number;
  pricePerTrolley: number;
  availability?: boolean;
}

export interface UpdateInventoryInput {
  totalBricks: number;
  availableTrolleys: number;
}

export const updateProductPricing = async (
  productId: string,
  input: UpdateProductPricingInput
): Promise<ProductDocument | null> => {
  return Product.findByIdAndUpdate(
    productId,
    {
      pricePer1000: input.pricePer1000,
      pricePerTrolley: input.pricePerTrolley,
      ...(typeof input.availability === 'boolean' ? { availability: input.availability } : {}),
    },
    { new: true }
  ).exec();
};

export const upsertInventory = async (
  input: UpdateInventoryInput
): Promise<InventoryDocument | null> => {
  return Inventory.findOneAndUpdate(
    {},
    {
      totalBricks: input.totalBricks,
      availableTrolleys: input.availableTrolleys,
    },
    {
      new: true,
      upsert: true,
      sort: { createdAt: -1 },
    }
  ).exec();
};

export const getLatestInventorySnapshot = async (): Promise<InventoryDocument | null> => {
  return Inventory.findOne().sort({ createdAt: -1 }).exec();
};

export const listEnquiries = async (limit: number = 100): Promise<any[]> => {
  return Enquiry.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
};

export const listOrders = async (limit: number = 20): Promise<any[]> => {
  return Order.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
};

export const deleteProductById = async (id: string): Promise<ProductDocument | null> => {
  return Product.findByIdAndDelete(id).exec();
};

export const deleteOrderById = async (id: string): Promise<OrderDocument | null> => {
  return Order.findByIdAndDelete(id).exec();
};

// Create Product
export interface CreateProductInput {
  name: string;
  type: string;
  pricePer1000: number;
  pricePerTrolley: number;
  availability?: boolean;
}

export const createProduct = async (input: CreateProductInput): Promise<ProductDocument> => {
  return Product.create({
    name: input.name,
    type: input.type,
    pricePer1000: input.pricePer1000,
    pricePerTrolley: input.pricePerTrolley,
    availability: input.availability ?? true,
  });
};

// Get All Products
export const getAllProducts = async (): Promise<ProductDocument[]> => {
  const products = await Product.find().sort({ createdAt: -1 }).lean().exec();
  return products as unknown as ProductDocument[];
};

// Update Enquiry Status
export interface UpdateEnquiryInput {
  status?: string;
  notes?: string;
}

export const updateEnquiryById = async (
  id: string,
  input: UpdateEnquiryInput
): Promise<any> => {
  return Enquiry.findByIdAndUpdate(
    id,
    {
      ...(input.status ? { status: input.status } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    },
    { new: true }
  ).lean().exec();
};

// Delete Enquiry
export const deleteEnquiryById = async (id: string): Promise<any> => {
  return Enquiry.findByIdAndDelete(id).lean().exec();
};

// Get Dashboard Statistics
export const getDashboardStats = async (): Promise<any> => {
  const [productCount, enquiryCount, orderCount, inventoryResult] = await Promise.all([
    Product.countDocuments().exec(),
    Enquiry.countDocuments().exec(),
    Order.countDocuments().exec(),
    Inventory.findOne().sort({ createdAt: -1 }).lean().exec(),
  ]);

  const inventory = inventoryResult as any;

  const recentEnquiries = await Enquiry.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  }).exec();

  const recentOrders = await Order.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  }).exec();

  return {
    products: {
      total: productCount,
      available: await Product.countDocuments({ availability: true }).exec(),
    },
    enquiries: {
      total: enquiryCount,
      thisWeek: recentEnquiries,
    },
    orders: {
      total: orderCount,
      thisWeek: recentOrders,
    },
    inventory: {
      totalBricks: inventory?.totalBricks || 0,
      availableTrolleys: inventory?.availableTrolleys || 0,
    },
  };
};
