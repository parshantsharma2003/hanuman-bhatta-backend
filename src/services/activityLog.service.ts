import ActivityLog, { ActivityActionType, ActivityLogDocument } from '../models/ActivityLog';

export interface CreateActivityLogInput {
  actionType: ActivityActionType;
  entityType: 'product' | 'inventory';
  entityId?: string;
  message: string;
  actorId?: string;
  actorName: string;
  actorRole: 'super_admin' | 'admin' | 'system';
  metadata?: Record<string, any>;
}

export const logActivity = async (
  input: CreateActivityLogInput
): Promise<ActivityLogDocument | null> => {
  try {
    return await ActivityLog.create(input);
  } catch (error) {
    console.error('Activity log error:', error);
    return null;
  }
};

export const listRecentActivity = async (limit: number = 30): Promise<ActivityLogDocument[]> => {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const logs = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean()
    .exec();

  return logs as unknown as ActivityLogDocument[];
};
