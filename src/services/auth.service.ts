import User, { UserDocument } from '../models/User';

export const findUserByEmail = async (email: string): Promise<UserDocument | null> => {
  return User.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
};

export const getUserById = async (id: string): Promise<UserDocument | null> => {
  return User.findById(id).exec();
};
