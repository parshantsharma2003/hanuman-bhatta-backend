import { Schema, model, models } from 'mongoose';

export type ActivityActionType =
  | 'price_change'
  | 'inventory_update'
  | 'product_archived'
  | 'product_restored';

export interface ActivityLogDocument {
  actionType: ActivityActionType;
  entityType: 'product' | 'inventory';
  entityId?: string;
  message: string;
  actorId?: string;
  actorName: string;
  actorRole: 'super_admin' | 'admin' | 'system';
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDocument>(
  {
    actionType: {
      type: String,
      enum: ['price_change', 'inventory_update', 'product_archived', 'product_restored'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['product', 'inventory'],
      required: true,
    },
    entityId: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [240, 'Message cannot exceed 240 characters'],
    },
    actorId: {
      type: String,
      trim: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, 'Actor name cannot exceed 120 characters'],
    },
    actorRole: {
      type: String,
      enum: ['super_admin', 'admin', 'system'],
      default: 'system',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ actionType: 1, createdAt: -1 });
ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityLog =
  models.ActivityLog || model<ActivityLogDocument>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
