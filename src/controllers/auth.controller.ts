import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import * as authService from '../services/auth.service';

const createToken = (payload: object) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
};

const isProduction = env.nodeEnv === 'production';
const cookieSameSite = isProduction ? 'none' : 'lax';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite,
    maxAge: 1000 * 60 * 60 * 12,
  });
};

export const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await authService.findUserByEmail(email);

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = createToken({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = (_req: Request, res: Response) => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: cookieSameSite,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      authenticated: !!user,
      data: user || null,
    });
  } catch (error) {
    next(error);
  }
};
