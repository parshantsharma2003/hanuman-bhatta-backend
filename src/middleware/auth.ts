import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import * as authService from '../services/auth.service';

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[env.cookieName];

    if (!token) {
      throw new AppError('Unauthorized', 401);
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const user = await authService.getUserById(decoded.id);

    if (!user || !user.isActive) {
      throw new AppError('Unauthorized', 401);
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || !['super_admin', 'admin'].includes(req.user.role)) {
    return next(new AppError('Access denied', 403));
  }

  return next();
};

export const authorizeRoles = (...roles: Array<'super_admin' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as 'super_admin' | 'admin')) {
      return next(new AppError('Access denied', 403));
    }

    return next();
  };
};
