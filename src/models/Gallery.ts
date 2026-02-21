import { Schema, model, models } from 'mongoose';

export interface GalleryDocument {
  type: 'image' | 'video';
  title?: string;
  description?: string;
  mediaUrl: string;
  publicId: string;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<GalleryDocument>(
  {
    type: {
      type: String,
      required: [true, 'Media type is required'],
      enum: ['image', 'video'],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    mediaUrl: {
      type: String,
      required: [true, 'Media URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
GallerySchema.index({ createdAt: -1 });
GallerySchema.index({ type: 1 });

const Gallery = models.Gallery || model<GalleryDocument>('Gallery', GallerySchema);

export default Gallery;
