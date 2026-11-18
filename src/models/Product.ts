import { Schema, model, models } from 'mongoose';

export interface ProductDocument {
  _id?: any;
  productId?: string;
  productCode?: string;
  name: string;
  localName?: string;
  alternativeNames?: string[];
  slug: string;
  grade: string; // 'Grade 1', 'Grade 1.5', 'Grade 2', 'Grade 3', 'Grade 4', etc.
  category?: string; // 'Premium Quality', 'Standard Quality', 'Budget Friendly', etc.
  badge?: string; // 'BEST SELLER', 'POPULAR CHOICE', etc.
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  images?: string[];
  type: string;
  pricePerBrick: number;
  pricePer1000: number;
  pricePerTrolley: number;
  pricingUnit?: string;
  characteristics?: string[];
  recommendedApplications?: string[];
  colourDescription?: string;
  soundDescription?: string;
  strengthLevel?: string;
  usageTags: string[];
  qualityGrade: string; // 'First' | 'Grade-1.5' | 'Second' | 'Third' | 'Fourth' | 'Rora' | string
  isActive: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  stockQuantity?: number;
  availabilityStatus?: 'In Stock' | 'Limited Stock' | 'Out of Stock' | 'Made to Order' | 'Availability on Request';
  availability: boolean; // Kept for backward compatibility
  isArchived: boolean;
  archivedAt?: Date;
  archivedBy?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    productId: {
      type: String,
      trim: true,
      index: true,
    },
    productCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters'],
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    localName: {
      type: String,
      trim: true,
      maxlength: [150, 'Local name cannot exceed 150 characters'],
    },
    alternativeNames: {
      type: [String],
      default: [],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [180, 'Slug cannot exceed 180 characters'],
    },
    grade: {
      type: String,
      trim: true,
      default: 'Grade 1',
    },
    category: {
      type: String,
      trim: true,
      default: 'Standard Quality',
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imagePublicId: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    type: {
      type: String,
      required: [true, 'Product type is required'],
      trim: true,
      maxlength: [100, 'Product type cannot exceed 100 characters'],
      default: 'Standard Brick',
    },
    pricePerBrick: {
      type: Number,
      required: [true, 'Price per brick is required'],
      min: [0, 'Price per brick cannot be negative'],
      default: 9,
    },
    pricePer1000: {
      type: Number,
      required: [true, 'Price per 1000 is required'],
      min: [0, 'Price cannot be negative'],
      default: 9000,
    },
    pricePerTrolley: {
      type: Number,
      required: [true, 'Price per trolley is required'],
      min: [0, 'Price cannot be negative'],
      default: 27000,
    },
    pricingUnit: {
      type: String,
      default: 'INR',
    },
    characteristics: {
      type: [String],
      default: [],
    },
    recommendedApplications: {
      type: [String],
      default: [],
    },
    colourDescription: {
      type: String,
      trim: true,
      default: '',
    },
    soundDescription: {
      type: String,
      trim: true,
      default: '',
    },
    strengthLevel: {
      type: String,
      trim: true,
      default: '',
    },
    usageTags: {
      type: [String],
      default: [],
    },
    qualityGrade: {
      type: String,
      required: [true, 'Quality grade is required'],
      trim: true,
      default: 'First',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ['In Stock', 'Limited Stock', 'Out of Stock', 'Made to Order', 'Availability on Request'],
      default: 'In Stock',
    },
    availability: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
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

// Add indexes for query performance
ProductSchema.index({ name: 1 });
ProductSchema.index({ grade: 1 });
ProductSchema.index({ displayOrder: 1, createdAt: -1 });

// Auto-generate slug from name if not provided
ProductSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  // Auto-fill pricePer1000 if only pricePerBrick given
  if (this.pricePerBrick && (!this.pricePer1000 || this.pricePer1000 === 0)) {
    this.pricePer1000 = Math.round(this.pricePerBrick * 1000);
  }
  // Auto-fill pricePerTrolley (3,000 bricks per standard trolley)
  if (this.pricePer1000 && (!this.pricePerTrolley || this.pricePerTrolley === 0)) {
    this.pricePerTrolley = Math.round(this.pricePer1000 * 3);
  }
  next();
});

export const Product = models.Product || model<ProductDocument>('Product', ProductSchema);

export default Product;
