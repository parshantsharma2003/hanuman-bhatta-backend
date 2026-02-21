import { NextFunction, Request, Response } from 'express';
import Order from '../models/Order';
import Inventory, { InventoryDocument } from '../models/Inventory';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

type BrickType = 'Avval' | 'Second' | 'Rora';
type UsagePurpose = 'House' | 'Boundary' | 'Filling';
type QuantityUnit = 'bricks' | 'trolleys';
type DistanceRange = '0-10km' | '10-25km' | '25+km';
type Urgency = 'immediate' | 'flexible';
type LeadPriority = 'hot' | 'warm' | 'normal';

const VALID_BRICK_TYPES: BrickType[] = ['Avval', 'Second', 'Rora'];
const VALID_USAGE: UsagePurpose[] = ['House', 'Boundary', 'Filling'];
const VALID_UNITS: QuantityUnit[] = ['bricks', 'trolleys'];
const VALID_DISTANCE: DistanceRange[] = ['0-10km', '10-25km', '25+km'];
const VALID_URGENCY: Urgency[] = ['immediate', 'flexible'];
const VALID_STATUS = ['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'];

const PRICE_PER_BRICK: Record<BrickType, { min: number; max: number }> = {
  Avval: { min: 8.5, max: 9.5 },
  Second: { min: 6.5, max: 7.5 },
  Rora: { min: 3.5, max: 4.5 },
};

const isPhoneValid = (value: string) => /^[0-9+\-\s()]{10,20}$/.test(value);

const getLeadPriority = (brickType: BrickType, quantityBricks: number, urgency: Urgency): LeadPriority => {
  if (brickType === 'Avval' || urgency === 'immediate' || quantityBricks >= 15000) {
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
  brickType: BrickType;
  quantityBricks: number;
  deliveryArea: string;
  leadPriority: LeadPriority;
}) => {
  const cleanAdminNumber = env.whatsappNumber.replace(/[^0-9]/g, '');
  const message = `🧱 *New Smart Order Lead*\n\n👤 Name: ${params.customerName}\n📞 Phone: ${params.phoneNumber}\n🧱 Brick Type: ${params.brickType}\n📦 Quantity: ${params.quantityBricks.toLocaleString()} bricks\n📍 Delivery Area: ${params.deliveryArea}\n🔥 Priority: ${params.leadPriority.toUpperCase()}`;
  return `https://wa.me/${cleanAdminNumber}?text=${encodeURIComponent(message)}`;
};

export const submitSmartOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      brickType,
      usagePurpose,
      quantityUnit,
      quantityValue,
      deliveryArea,
      landmark,
      distanceRange,
      requiredDeliveryDate,
      urgency,
      name,
      phoneNumber,
      email,
      whatsappNumber,
      isWhatsappSame,
    } = req.body || {};

    if (!VALID_BRICK_TYPES.includes(brickType)) {
      throw new AppError('Valid brick type is required', 400);
    }
    if (!VALID_USAGE.includes(usagePurpose)) {
      throw new AppError('Valid usage purpose is required', 400);
    }
    if (!VALID_UNITS.includes(quantityUnit)) {
      throw new AppError('Valid quantity unit is required', 400);
    }
    if (!VALID_DISTANCE.includes(distanceRange)) {
      throw new AppError('Valid distance range is required', 400);
    }
    if (!VALID_URGENCY.includes(urgency)) {
      throw new AppError('Valid urgency is required', 400);
    }

    if (typeof quantityValue !== 'number' || Number.isNaN(quantityValue) || quantityValue <= 0) {
      throw new AppError('Quantity must be greater than zero', 400);
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new AppError('Name must be at least 2 characters', 400);
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !isPhoneValid(phoneNumber)) {
      throw new AppError('Valid phone number is required', 400);
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      throw new AppError('Valid email is required', 400);
    }

    const whatsappValue = isWhatsappSame ? phoneNumber : whatsappNumber;
    if (!whatsappValue || typeof whatsappValue !== 'string' || !isPhoneValid(whatsappValue)) {
      throw new AppError('Valid WhatsApp number is required', 400);
    }

    if (!deliveryArea || typeof deliveryArea !== 'string' || deliveryArea.trim().length < 2) {
      throw new AppError('Delivery area is required', 400);
    }

    const requestedDate = new Date(requiredDeliveryDate);
    if (!requiredDeliveryDate || Number.isNaN(requestedDate.getTime())) {
      throw new AppError('Valid required delivery date is required', 400);
    }

    const quantityBricks = quantityUnit === 'bricks'
      ? Math.round(quantityValue)
      : Math.round(quantityValue * env.bricksPerTrolley);

    if (quantityBricks <= 0) {
      throw new AppError('Requested quantity is invalid', 400);
    }

    const quantityTrolleys = quantityBricks / env.bricksPerTrolley;
    const leadPriority = getLeadPriority(brickType, quantityBricks, urgency);

    const inventory = (await Inventory.findOne().sort({ createdAt: -1 }).lean().exec()) as (InventoryDocument & { _id?: any }) | null;
    const availableBricks = inventory?.totalBricks || 0;
    const isStockLimited = quantityBricks > availableBricks;

    const priceBand = PRICE_PER_BRICK[brickType as BrickType];
    const estimatedPriceMin = Math.round(quantityBricks * priceBand.min);
    const estimatedPriceMax = Math.round(quantityBricks * priceBand.max);

    const whatsappMessageUrl = buildAdminWhatsAppUrl({
      customerName: name.trim(),
      phoneNumber: phoneNumber.trim(),
      brickType,
      quantityBricks,
      deliveryArea: deliveryArea.trim(),
      leadPriority,
    });

    const order = await Order.create({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      whatsappNumber: whatsappValue.trim(),
      isWhatsappSame: Boolean(isWhatsappSame),
      brickType,
      usagePurpose,
      quantityUnit,
      quantityBricks,
      quantityTrolleys,
      quantity: quantityBricks,
      deliveryArea: deliveryArea.trim(),
      landmark: typeof landmark === 'string' && landmark.trim() ? landmark.trim() : undefined,
      distanceRange,
      requiredDeliveryDate: requestedDate,
      urgency,
      leadPriority,
      status: 'pending',
      whatsappMessageUrl,
      fullName: name.trim(),
      mobileNumber: phoneNumber.trim(),
      customerName: name.trim(),
      phone: phoneNumber.trim(),
      address: deliveryArea.trim(),
      product: brickType,
      totalPrice: estimatedPriceMin,
    });

    res.status(201).json({
      success: true,
      message: 'Order submitted successfully',
      data: {
        order,
        leadPriority,
        stock: {
          availableBricks,
          requestedBricks: quantityBricks,
          limited: isStockLimited,
        },
        estimate: {
          min: estimatedPriceMin,
          max: estimatedPriceMax,
        },
        adminWhatsAppUrl: whatsappMessageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const orders = await Order.find().sort({ createdAt: -1 }).limit(limit).lean().exec();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Valid order ID is required', 400);
    }

    if (status !== undefined && !VALID_STATUS.includes(status)) {
      throw new AppError('Invalid order status', 400);
    }

    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) {
      throw new AppError('Notes must be up to 500 characters', 400);
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        ...(status ? { status } : {}),
        ...(typeof notes === 'string' ? { notes: notes.trim() } : {}),
      },
      { new: true }
    ).lean();

    if (!updated) {
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

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
