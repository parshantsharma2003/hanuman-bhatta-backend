import { Schema, model, models } from 'mongoose';

export interface OrderDocument {
  _id?: any;
  name: string;
  phoneNumber: string;
  email: string;
  whatsappNumber: string;
  isWhatsappSame: boolean;
  brickType: string;
  usagePurpose: 'House' | 'Boundary' | 'Filling';
  quantityUnit: 'bricks' | 'trolleys';
  quantityBricks: number;
  quantityTrolleys: number;
  quantity: number;
  deliveryArea: string;
  landmark?: string;
  distanceRange: '0-10km' | '10-25km' | '25+km';
  requiredDeliveryDate: Date;
  urgency: 'immediate' | 'flexible';
  leadPriority: 'hot' | 'warm' | 'normal';
  notes?: string;
  status: string;
  whatsappMessageUrl?: string;

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

const OrderSchema = new Schema<OrderDocument>(
  {
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
      enum: {
        values: ['Avval', 'Second', 'Rora'],
        message: '{VALUE} is not a valid brick type',
      },
    },
    usagePurpose: {
      type: String,
      required: [true, 'Usage purpose is required'],
      enum: {
        values: ['House', 'Boundary', 'Filling'],
        message: '{VALUE} is not a valid usage purpose',
      },
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
    deliveryArea: {
      type: String,
      required: [true, 'Delivery area is required'],
      trim: true,
      maxlength: [200, 'Delivery area cannot exceed 200 characters'],
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [200, 'Landmark cannot exceed 200 characters'],
    },
    distanceRange: {
      type: String,
      required: [true, 'Distance range is required'],
      enum: {
        values: ['0-10km', '10-25km', '25+km'],
        message: '{VALUE} is not a valid distance range',
      },
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
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: [
          'pending',
          'processing',
          'confirmed',
          'in_progress',
          'dispatched',
          'delivered',
          'cancelled',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    whatsappMessageUrl: {
      type: String,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    product: {
      type: String,
      trim: true,
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ phoneNumber: 1 });
OrderSchema.index({ leadPriority: 1, createdAt: -1 });
OrderSchema.index({ brickType: 1, createdAt: -1 });

export const Order = models.Order || model<OrderDocument>('Order', OrderSchema);

export default Order;
