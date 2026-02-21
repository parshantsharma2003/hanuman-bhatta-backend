import { Schema, model, models } from 'mongoose';

export interface EnquiryDocument {
  name: string;
  phone: string;
  message: string;
  status?: string;
  notes?: string;
  createdAt: Date;
}

const EnquirySchema = new Schema<EnquiryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'resolved', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
  }
);

// Add index for better query performance
EnquirySchema.index({ createdAt: -1 });

export const Enquiry = models.Enquiry || model<EnquiryDocument>('Enquiry', EnquirySchema);

export default Enquiry;
