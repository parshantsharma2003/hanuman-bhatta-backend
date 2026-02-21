import { Schema, model, models } from 'mongoose';

export interface ProductDocument {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  type: string;
  pricePer1000: number;
  pricePerTrolley: number;
  usageTags: string[];
  qualityGrade: 'First' | 'Second' | 'Rora';
  isActive: boolean;
  availability: boolean; // Keep for backward compatibility
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [150, 'Slug cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imagePublicId: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      trim: true,
      maxlength: [80, 'Product type cannot exceed 80 characters'],
    },
    pricePer1000: {
      type: Number,
      required: [true, 'Price per 1000 is required'],
      min: [0, 'Price cannot be negative'],
    },
    pricePerTrolley: {
      type: Number,
      required: [true, 'Price per trolley is required'],
      min: [0, 'Price cannot be negative'],
    },
    usageTags: {
      type: [String],
      default: [],
    },
    qualityGrade: {
      type: String,
      required: [true, 'Quality grade is required'],
      enum: ['First', 'Second', 'Rora'],
      default: 'First',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: undefined,
    },
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ name: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ isArchived: 1 });
ProductSchema.index({ qualityGrade: 1 });
ProductSchema.index({ availability: 1 });

// Auto-generate slug from name if not provided
ProductSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const Product = models.Product || model<ProductDocument>('Product', ProductSchema);

export default Product;
