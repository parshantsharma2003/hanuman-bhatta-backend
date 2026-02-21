import { Schema, model, models } from 'mongoose';

export type AnalyticsMetricType =
  | 'whatsapp_click'
  | 'call_click'
  | 'order_click'
  | 'calculator_use';

export interface AnalyticsDocument {
  metricType: AnalyticsMetricType;
  count: number;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AnalyticsSchema = new Schema<AnalyticsDocument>(
  {
    metricType: {
      type: String,
      required: true,
      unique: true,
      enum: ['whatsapp_click', 'call_click', 'order_click', 'calculator_use'],
    },
    count: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Count cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AnalyticsSchema.index({ metricType: 1 }, { unique: true });

export const Analytics = models.Analytics || model<AnalyticsDocument>('Analytics', AnalyticsSchema);

export default Analytics;
