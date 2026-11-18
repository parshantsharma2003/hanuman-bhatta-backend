import { Schema, model, models } from 'mongoose';

export interface GradeInventoryItem {
  grade: string;
  productName: string;
  localName?: string;
  availableQuantity: number;
  reservedQuantity: number;
  dispatchedQuantity: number;
  stockStatus: 'In Stock' | 'Limited Stock' | 'Out of Stock' | 'Made to Order' | 'Availability on Request';
  internalRemarks?: string;
  lastUpdated?: Date;
}

export interface InventoryDocument {
  _id?: any;
  totalBricks: number;
  availableTrolleys: number;
  items: GradeInventoryItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const GradeInventorySchema = new Schema<GradeInventoryItem>(
  {
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    localName: {
      type: String,
      trim: true,
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Available quantity cannot be negative'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },
    dispatchedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Dispatched quantity cannot be negative'],
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Limited Stock', 'Out of Stock', 'Made to Order', 'Availability on Request'],
      default: 'In Stock',
    },
    internalRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const InventorySchema = new Schema<InventoryDocument>(
  {
    totalBricks: {
      type: Number,
      required: [true, 'Total bricks count is required'],
      min: [0, 'Total bricks cannot be negative'],
      default: 0,
    },
    availableTrolleys: {
      type: Number,
      required: [true, 'Available trolleys count is required'],
      min: [0, 'Available trolleys cannot be negative'],
      default: 0,
    },
    items: {
      type: [GradeInventorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = models.Inventory || model<InventoryDocument>('Inventory', InventorySchema);

export default Inventory;
