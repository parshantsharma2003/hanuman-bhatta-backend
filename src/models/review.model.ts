import mongoose, { Document, Schema } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved';

export interface IReview extends Document {
  rating: number;
  comment: string;
  name?: string;
  location?: string;
  status: ReviewStatus;
  isApproved?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 300,
      trim: true,
    },
    name: {
      type: String,
      maxlength: 80,
      trim: true,
    },
    location: {
      type: String,
      maxlength: 120,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.pre('save', function syncApprovalFlag(next) {
  this.isApproved = this.status === 'approved';
  next();
});

ReviewSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function syncApprovalUpdate(next) {
  const update = this.getUpdate() as Record<string, unknown> | undefined;
  if (!update) {
    next();
    return;
  }

  const status = (update.status || (update.$set as Record<string, unknown> | undefined)?.status) as
    | ReviewStatus
    | undefined;

  if (status) {
    this.setUpdate({
      ...update,
      $set: {
        ...(update.$set as Record<string, unknown> | undefined),
        status,
        isApproved: status === 'approved',
      },
    });
  }

  next();
});

const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default ReviewModel;
