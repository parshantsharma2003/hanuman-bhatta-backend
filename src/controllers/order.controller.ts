import { NextFunction, Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

type QuantityUnit = 'bricks' | 'trolleys';
type Urgency = 'immediate' | 'flexible';
type LeadPriority = 'hot' | 'warm' | 'normal';

// Standard 5-Grade mapping with fallback rates
const FALLBACK_BRICK_DATA: Record<
  string,
  { name: string; localName: string; grade: string; pricePerBrick: number; pricePer1000: number }
> = {
  // First class mappings
  'First Class Bricks': { name: 'First Class Bricks', localName: 'Awwal / अव्वल', grade: 'Grade 1', pricePerBrick: 9.0, pricePer1000: 9000 },
  'Avval': { name: 'First Class Bricks', localName: 'Awwal / अव्वल', grade: 'Grade 1', pricePerBrick: 9.0, pricePer1000: 9000 },
  'Awwal': { name: 'First Class Bricks', localName: 'Awwal / अव्वल', grade: 'Grade 1', pricePerBrick: 9.0, pricePer1000: 9000 },
  'Grade 1': { name: 'First Class Bricks', localName: 'Awwal / अव्वल', grade: 'Grade 1', pricePerBrick: 9.0, pricePer1000: 9000 },

  // Standard / Laal Peti mappings
  'Standard Bricks': { name: 'Standard Bricks', localName: 'Laal Peti / लाल पेटी', grade: 'Grade 1.5', pricePerBrick: 8.5, pricePer1000: 8500 },
  'Laal Peti': { name: 'Standard Bricks', localName: 'Laal Peti / लाल पेटी', grade: 'Grade 1.5', pricePerBrick: 8.5, pricePer1000: 8500 },
  'Lal Petty': { name: 'Standard Bricks', localName: 'Laal Peti / लाल पेटी', grade: 'Grade 1.5', pricePerBrick: 8.5, pricePer1000: 8500 },
  'Grade 1.5': { name: 'Standard Bricks', localName: 'Laal Peti / लाल पेटी', grade: 'Grade 1.5', pricePerBrick: 8.5, pricePer1000: 8500 },

  // Second class / Duyam mappings
  'Second Class Bricks': { name: 'Second Class Bricks', localName: 'Duyam / दुयम', grade: 'Grade 2', pricePerBrick: 8.0, pricePer1000: 8000 },
  'Second': { name: 'Second Class Bricks', localName: 'Duyam / दुयम', grade: 'Grade 2', pricePerBrick: 8.0, pricePer1000: 8000 },
  'Duyam': { name: 'Second Class Bricks', localName: 'Duyam / दुयम', grade: 'Grade 2', pricePerBrick: 8.0, pricePer1000: 8000 },
  'Grade 2': { name: 'Second Class Bricks', localName: 'Duyam / दुयम', grade: 'Grade 2', pricePerBrick: 8.0, pricePer1000: 8000 },

  // Third class / Peela mappings
  'Third Class Bricks': { name: 'Third Class Bricks', localName: 'Peela Eent / पीला', grade: 'Grade 3', pricePerBrick: 7.5, pricePer1000: 7500 },
  'Peela': { name: 'Third Class Bricks', localName: 'Peela Eent / पीला', grade: 'Grade 3', pricePerBrick: 7.5, pricePer1000: 7500 },
  'Peela Eent': { name: 'Third Class Bricks', localName: 'Peela Eent / पीला', grade: 'Grade 3', pricePerBrick: 7.5, pricePer1000: 7500 },
  'Grade 3': { name: 'Third Class Bricks', localName: 'Peela Eent / पीला', grade: 'Grade 3', pricePerBrick: 7.5, pricePer1000: 7500 },

  // Fourth class / Chatka mappings
  'Fourth Class Bricks': { name: 'Fourth Class Bricks', localName: 'Chatka Eent / छटका', grade: 'Grade 4', pricePerBrick: 6.0, pricePer1000: 6000 },
  'Chatka': { name: 'Fourth Class Bricks', localName: 'Chatka Eent / छटका', grade: 'Grade 4', pricePerBrick: 6.0, pricePer1000: 6000 },
  'Chatka Eent': { name: 'Fourth Class Bricks', localName: 'Chatka Eent / छटका', grade: 'Grade 4', pricePerBrick: 6.0, pricePer1000: 6000 },
  'Rora': { name: 'Fourth Class Bricks', localName: 'Chatka Eent / छटका', grade: 'Grade 4', pricePerBrick: 6.0, pricePer1000: 6000 },
  'Grade 4': { name: 'Fourth Class Bricks', localName: 'Chatka Eent / छटका', grade: 'Grade 4', pricePerBrick: 6.0, pricePer1000: 6000 },
};

const VALID_STATUS = [
  'pending',
  'new_enquiry',
  'under_review',
  'quotation_prepared',
  'quotation_sent',
  'customer_approved',
  'scheduled_for_dispatch',
  'confirmed',
  'in_progress',
  'dispatched',
  'delivered',
  'cancelled',
];

const isPhoneValid = (value: string) => /^[0-9+\-\s()]{10,20}$/.test(value);

const resolveProductPricing = async (brickType: string) => {
  // Try querying from the database first
  const dbProduct: any = await Product.findOne({
    $or: [
      { name: new RegExp(`^${brickType.trim()}$`, 'i') },
      { slug: new RegExp(`^${brickType.trim()}$`, 'i') },
      { grade: new RegExp(`^${brickType.trim()}$`, 'i') },
      { alternativeNames: new RegExp(`^${brickType.trim()}$`, 'i') },
      { type: new RegExp(`^${brickType.trim()}$`, 'i') },
    ],
    isActive: true,
  }).lean().exec();

  if (dbProduct) {
    const pricePerBrick =
      Number(dbProduct.pricePerBrick) ||
      (dbProduct.pricePer1000 ? dbProduct.pricePer1000 / 1000 : 9.0);
    const pricePer1000 = dbProduct.pricePer1000 || pricePerBrick * 1000;

    return {
      productId: String(dbProduct._id),
      name: dbProduct.name,
      localName: dbProduct.localName || dbProduct.name,
      grade: dbProduct.grade || 'Grade 1',
      pricePerBrick,
      pricePer1000,
    };
  }

  // Fallback to static mapping
  const normalized = Object.keys(FALLBACK_BRICK_DATA).find(
    (k) => k.toLowerCase() === brickType.trim().toLowerCase()
  );

  if (normalized) {
    const fb = FALLBACK_BRICK_DATA[normalized];
    return {
      productId: undefined,
      name: fb.name,
      localName: fb.localName,
      grade: fb.grade,
      pricePerBrick: fb.pricePerBrick,
      pricePer1000: fb.pricePer1000,
    };
  }

  // Default to Grade 1
  return {
    productId: undefined,
    name: brickType || 'First Class Bricks',
    localName: 'Awwal / अव्वल',
    grade: 'Grade 1',
    pricePerBrick: 9.0,
    pricePer1000: 9000,
  };
};

const getLeadPriority = (grade: string, quantityBricks: number, urgency: Urgency): LeadPriority => {
  if (grade === 'Grade 1' || urgency === 'immediate' || quantityBricks >= 15000) {
    return 'hot';
  }
  if (quantityBricks >= 6000 || urgency === 'flexible') {
    return 'warm';
  }
  return 'normal';
};

const buildAdminWhatsAppUrl = (params: {
  customerName: string;
  phoneNumber: string;
  productName: string;
  grade: string;
  quantityBricks: number;
  deliveryArea: string;
  deliveryType: string;
  estimatedSubtotal: number;
  leadPriority: LeadPriority;
}) => {
  const cleanAdminNumber = env.whatsappNumber.replace(/[^0-9]/g, '');
  const message =
    `🧱 *New Brick Order Enquiry — Hanuman Bhatta Company*\n\n` +
    `👤 Customer: ${params.customerName}\n` +
    `📞 Phone: ${params.phoneNumber}\n` +
    `🧱 Product: ${params.productName} (${params.grade})\n` +
    `📦 Quantity: ${params.quantityBricks.toLocaleString('en-IN')} bricks\n` +
    `💰 Indicative Subtotal: ₹${params.estimatedSubtotal.toLocaleString('en-IN')}\n` +
    `📍 Delivery Location: ${params.deliveryArea}\n` +
    `🚚 Transit: ${params.deliveryType === 'self_pickup' ? 'Self-Pickup' : 'Kiln Tractor-Trolley Delivery'}\n` +
    `🔥 Priority: ${params.leadPriority.toUpperCase()}`;

  return `https://wa.me/${cleanAdminNumber}?text=${encodeURIComponent(message)}`;
};

// @desc    Submit new customer order enquiry (Public)
// @route   POST /api/v1/orders
// @access  Public
export const submitSmartOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      brickType,
      usagePurpose = 'House',
      quantityUnit = 'bricks',
      quantityValue,
      deliveryArea,
      landmark,
      village,
      district,
      pincode,
      deliveryType = 'delivery',
      distanceRange = '0-10km',
      requiredDeliveryDate,
      urgency = 'flexible',
      name,
      phoneNumber,
      email,
      whatsappNumber,
      isWhatsappSame = true,
      customerInstructions,
    } = req.body || {};

    if (!brickType || typeof brickType !== 'string' || brickType.trim().length === 0) {
      throw new AppError('Brick product selection is required', 400);
    }

    if (typeof quantityValue !== 'number' || Number.isNaN(quantityValue) || quantityValue <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new AppError('Customer name must be at least 2 characters', 400);
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !isPhoneValid(phoneNumber)) {
      throw new AppError('Valid phone number is required (10-15 digits)', 400);
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new AppError('Valid email address is required', 400);
    }

    const whatsappValue = isWhatsappSame ? phoneNumber : whatsappNumber;
    if (!whatsappValue || typeof whatsappValue !== 'string' || !isPhoneValid(whatsappValue)) {
      throw new AppError('Valid WhatsApp number is required', 400);
    }

    if (!deliveryArea || typeof deliveryArea !== 'string' || deliveryArea.trim().length < 2) {
      throw new AppError('Delivery area or address is required', 400);
    }

    const requestedDate = requiredDeliveryDate ? new Date(requiredDeliveryDate) : new Date(Date.now() + 86400000);

    const bricksPerTrolley = env.bricksPerTrolley || 3000;
    const quantityBricks =
      quantityUnit === 'bricks'
        ? Math.round(quantityValue)
        : Math.round(quantityValue * bricksPerTrolley);

    if (quantityBricks <= 0) {
      throw new AppError('Requested brick quantity is invalid', 400);
    }

    const quantityTrolleys = Math.round((quantityBricks / bricksPerTrolley) * 100) / 100;

    // Resolve accurate pricing from database or fallback catalog
    const productInfo = await resolveProductPricing(brickType);

    // Calculate server-side subtotal strictly from verified unit price
    const estimatedSubtotal = Math.round(quantityBricks * productInfo.pricePerBrick);
    const leadPriority = getLeadPriority(productInfo.grade, quantityBricks, urgency as Urgency);

    const whatsappMessageUrl = buildAdminWhatsAppUrl({
      customerName: name.trim(),
      phoneNumber: phoneNumber.trim(),
      productName: productInfo.name,
      grade: productInfo.grade,
      quantityBricks,
      deliveryArea: deliveryArea.trim(),
      deliveryType,
      estimatedSubtotal,
      leadPriority,
    });

    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderNumber = `HBC-${dateStr}-${randomHex}`;

    // Create order with complete historical snapshot
    const order = await Order.create({
      orderNumber,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      whatsappNumber: whatsappValue.trim(),
      isWhatsappSame: Boolean(isWhatsappSame),
      brickType: productInfo.name,
      grade: productInfo.grade,
      usagePurpose,
      quantityUnit,
      quantityBricks,
      quantityTrolleys,
      quantity: quantityBricks,
      items: [
        {
          productId: productInfo.productId,
          productName: productInfo.name,
          localName: productInfo.localName,
          grade: productInfo.grade,
          quantity: quantityBricks,
          unit: 'bricks',
          pricePerBrickAtOrder: productInfo.pricePerBrick,
          pricePerThousandAtOrder: productInfo.pricePer1000,
          estimatedSubtotal,
        },
      ],
      deliveryType: deliveryType === 'self_pickup' ? 'self_pickup' : 'delivery',
      deliveryArea: deliveryArea.trim(),
      village: village?.trim(),
      district: district?.trim() || 'Sonipat / Gohana',
      pincode: pincode?.trim(),
      landmark: typeof landmark === 'string' && landmark.trim() ? landmark.trim() : undefined,
      distanceRange,
      requiredDeliveryDate: requestedDate,
      urgency,
      leadPriority,
      status: 'pending',
      whatsappMessageUrl,
      customerInstructions: customerInstructions?.trim(),

      // Pricing snapshot
      pricePerBrickAtOrder: productInfo.pricePerBrick,
      pricePerThousandAtOrder: productInfo.pricePer1000,
      estimatedSubtotal,

      // Legacy field compatibility
      fullName: name.trim(),
      mobileNumber: phoneNumber.trim(),
      customerName: name.trim(),
      phone: phoneNumber.trim(),
      address: deliveryArea.trim(),
      product: productInfo.name,
      totalPrice: estimatedSubtotal,
    });

    res.status(201).json({
      success: true,
      message: 'Order enquiry submitted successfully. Our dispatch manager will contact you with confirmed quotation.',
      data: {
        order,
        leadPriority,
        orderNumber,
        product: {
          name: productInfo.name,
          localName: productInfo.localName,
          grade: productInfo.grade,
          pricePerBrick: productInfo.pricePerBrick,
          pricePer1000: productInfo.pricePer1000,
        },
        estimate: {
          subtotal: estimatedSubtotal,
          pricePerBrick: productInfo.pricePerBrick,
          quantityBricks,
          isIndicative: true,
        },
        adminWhatsAppUrl: whatsappMessageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/admin/orders
// @access  Private (Super Admin / Admin)
export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { phoneNumber: searchRegex },
        { orderNumber: searchRegex },
        { deliveryArea: searchRegex },
        { brickType: searchRegex },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit).lean().exec();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/v1/admin/orders/:id
// @access  Private (Super Admin / Admin)
export const getAdminOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid order ID is required', 400);
    }

    const order = await Order.findById(id).lean().exec();
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status or quotation (Admin)
// @route   PUT /api/v1/admin/orders/:id
// @access  Private (Super Admin / Admin)
export const updateAdminOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const {
      status,
      notes,
      quotedPricePerBrick,
      transportCharges,
      discount,
      quotationNotes,
      quotationStatus,
    } = req.body || {};

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid order ID is required', 400);
    }

    if (status !== undefined && !VALID_STATUS.includes(status)) {
      throw new AppError('Invalid order status', 400);
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      throw new AppError('Order not found', 404);
    }

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (typeof notes === 'string') updateFields.notes = notes.trim();

    // Quotation Management calculation
    if (quotedPricePerBrick !== undefined || transportCharges !== undefined || discount !== undefined) {
      const activeRate =
        quotedPricePerBrick !== undefined
          ? Number(quotedPricePerBrick)
          : existingOrder.quotedPricePerBrick || existingOrder.pricePerBrickAtOrder || 9.0;

      const activeTransport =
        transportCharges !== undefined ? Number(transportCharges) : existingOrder.transportCharges || 0;

      const activeDiscount = discount !== undefined ? Number(discount) : existingOrder.discount || 0;

      const quotedSubtotal = Math.round(existingOrder.quantityBricks * activeRate);
      const finalQuotation = Math.max(0, quotedSubtotal + activeTransport - activeDiscount);

      updateFields.quotedPricePerBrick = activeRate;
      updateFields.quotedSubtotal = quotedSubtotal;
      updateFields.transportCharges = activeTransport;
      updateFields.discount = activeDiscount;
      updateFields.finalQuotation = finalQuotation;
      updateFields.totalPrice = finalQuotation;
      if (quotationStatus) updateFields.quotationStatus = quotationStatus;
      if (quotationNotes) updateFields.quotationNotes = quotationNotes.trim();
    }

    const updated = await Order.findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order (Super Admin)
// @route   DELETE /api/v1/admin/orders/:id
// @access  Private (Super Admin)
export const deleteAdminOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid order ID is required', 400);
    }

    const deleted = await Order.findByIdAndDelete(id).lean().exec();

    if (!deleted) {
      throw new AppError('Order not found', 404);
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
