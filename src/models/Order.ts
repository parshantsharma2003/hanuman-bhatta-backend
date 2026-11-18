import { Schema, model, models } from 'mongoose';

export interface OrderItemSnapshot {
  productId?: string;
  productName: string;
  localName?: string;
  grade?: string;
  quantity: number;
  unit: 'bricks' | 'trolleys';
  pricePerBrickAtOrder: number;
  pricePerThousandAtOrder: number;
  estimatedSubtotal: number;
}

export interface OrderDocument {
  _id?: any;
  orderNumber?: string;
  name: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
  isWhatsappSame: boolean;
  brickType: string;
  grade?: string;
  usagePurpose: string;
  quantityUnit: 'bricks' | 'trolleys';
  quantityBricks: number;
  quantityTrolleys: number;
  quantity: number;
  items?: OrderItemSnapshot[];
  
  // Delivery details
  deliveryType?: 'delivery' | 'self_pickup';
  deliveryArea: string;
  village?: string;
  district?: string;
  pincode?: string;
  landmark?: string;
  distanceRange: string;
  requiredDeliveryDate: Date;
  urgency: 'immediate' | 'flexible';
  leadPriority: 'hot' | 'warm' | 'normal';
  notes?: string;
  customerInstructions?: string;

  // Pricing & Quotation Snapshot (Preserves historical pricing at order time)
  pricePerBrickAtOrder?: number;
  pricePerThousandAtOrder?: number;
  estimatedSubtotal?: number;
  quotedPricePerBrick?: number;
  quotedSubtotal?: number;
  transportCharges?: number;
  discount?: number;
  finalQuotation?: number;
  quotationNotes?: string;
  quotationStatus?: 'none' | 'prepared' | 'sent' | 'approved' | 'rejected';

  // Order Lifecycle Status
  status: string;
  whatsappMessageUrl?: string;

  // Legacy field support for backward compatibility
  fullName?: string;
  mobileNumber?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  product?: string;
  totalPrice?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<OrderItemSnapshot>(
  {
    productId: { type: String, trim: true },
    productName: { type: String, required: true },
    localName: { type: String },
    grade: { type: String },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'bricks' },
    pricePerBrickAtOrder: { type: Number, required: true },
    pricePerThousandAtOrder: { type: Number, required: true },
    estimatedSubtotal: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    orderNumber: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Mobile number cannot exceed 20 characters'],
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid mobile number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: [120, 'Email cannot exceed 120 characters'],
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      maxlength: [20, 'WhatsApp number cannot exceed 20 characters'],
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid WhatsApp number'],
    },
    isWhatsappSame: {
      type: Boolean,
      default: true,
    },
    brickType: {
      type: String,
      required: [true, 'Brick type is required'],
      trim: true,
    },
    grade: {
      type: String,
      trim: true,
      default: 'Grade 1',
    },
    usagePurpose: {
      type: String,
      required: [true, 'Usage purpose is required'],
      trim: true,
      default: 'House',
    },
    quantityUnit: {
      type: String,
      required: [true, 'Quantity unit is required'],
      enum: {
        values: ['bricks', 'trolleys'],
        message: '{VALUE} is not a valid quantity unit',
      },
      default: 'bricks',
    },
    quantityBricks: {
      type: Number,
      required: [true, 'Brick quantity is required'],
      min: [1, 'Brick quantity must be at least 1'],
    },
    quantityTrolleys: {
      type: Number,
      required: [true, 'Trolley quantity is required'],
      min: [0.01, 'Trolley quantity must be greater than 0'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    deliveryType: {
      type: String,
      enum: ['delivery', 'self_pickup'],
      default: 'delivery',
    },
    deliveryArea: {
      type: String,
      required: [true, 'Delivery area is required'],
      trim: true,
      maxlength: [300, 'Delivery area cannot exceed 300 characters'],
    },
    village: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    district: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'Sonipat / Gohana',
    },
    pincode: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [200, 'Landmark cannot exceed 200 characters'],
    },
    distanceRange: {
      type: String,
      required: [true, 'Distance range is required'],
      default: '0-10km',
    },
    requiredDeliveryDate: {
      type: Date,
      required: [true, 'Required delivery date is required'],
    },
    urgency: {
      type: String,
      required: [true, 'Urgency is required'],
      enum: {
        values: ['immediate', 'flexible'],
        message: '{VALUE} is not a valid urgency level',
      },
      default: 'flexible',
    },
    leadPriority: {
      type: String,
      required: true,
      enum: {
        values: ['hot', 'warm', 'normal'],
        message: '{VALUE} is not a valid lead priority',
      },
      default: 'normal',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    customerInstructions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Price snapshot at time of enquiry
    pricePerBrickAtOrder: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    pricePerThousandAtOrder: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    estimatedSubtotal: {
      type: Number,
      min: [0, 'Subtotal cannot be negative'],
    },

    // Admin negotiated quotation fields
    quotedPricePerBrick: {
      type: Number,
      min: [0, 'Quoted price cannot be negative'],
    },
    quotedSubtotal: {
      type: Number,
      min: [0, 'Quoted subtotal cannot be negative'],
    },
    transportCharges: {
      type: Number,
      default: 0,
      min: [0, 'Transport charges cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    finalQuotation: {
      type: Number,
      min: [0, 'Final quotation cannot be negative'],
    },
    quotationNotes: {
      type: String,
      trim: true,
    },
    quotationStatus: {
      type: String,
      enum: ['none', 'prepared', 'sent', 'approved', 'rejected'],
      default: 'none',
    },

    status: {
      type: String,
      required: true,
      trim: true,
      default: 'pending',
    },
    whatsappMessageUrl: {
      type: String,
      trim: true,
    },

    // Backward compatibility fields
    fullName: { type: String, trim: true },
    mobileNumber: { type: String, trim: true },
    customerName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    product: { type: String, trim: true },
    totalPrice: { type: Number, min: [0, 'Total price cannot be negative'] },
  },
  {
    timestamps: true,
  }
);

// Auto-generate order number before save if not provided
OrderSchema.pre('save', function (this: any, next) {
  if (!this.orderNumber) {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    this.orderNumber = `HBC-${dateStr}-${randomHex}`;
  }
  // Sync legacy fields
  this.fullName = this.name;
  this.customerName = this.name;
  this.mobileNumber = this.phoneNumber;
  this.phone = this.phoneNumber;
  this.address = this.deliveryArea;
  this.product = this.brickType;
  if (!this.totalPrice && this.estimatedSubtotal) {
    this.totalPrice = this.estimatedSubtotal;
  }
  next();
});

// Add indexes for query performance
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ phoneNumber: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ leadPriority: 1, createdAt: -1 });
OrderSchema.index({ brickType: 1, createdAt: -1 });

export const Order = models.Order || model<OrderDocument>('Order', OrderSchema);

export default Order;
