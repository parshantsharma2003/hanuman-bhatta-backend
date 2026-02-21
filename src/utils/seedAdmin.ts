import User from '../models/User';
import { env } from '../config/env';

export const ensureAdminUser = async (): Promise<void> => {
  const adminEmail = env.adminEmail.toLowerCase().trim();

  const existing = await User.findOne({ email: adminEmail }).exec();

  if (existing) {
    return;
  }

  await User.create({
    name: env.adminName,
    email: adminEmail,
    password: env.adminPassword,
    role: 'super_admin',
    isActive: true,
  });

  console.log('✅ Admin user seeded');
};
