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

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};

const resolveUserFromRequest = async (req: Request) => {
  const cookieToken = req.cookies?.[env.cookieName];
  const bearerToken = getBearerToken(req.headers.authorization);
  const token = cookieToken || bearerToken;

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
  const user = await authService.getUserById(decoded.id);

  if (!user || !user.isActive) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authUser = await resolveUserFromRequest(req);

    if (!authUser) {
      throw new AppError('Unauthorized', 401);
    }

    req.user = authUser;

    next();
  } catch (error) {
    next(error);
  }
};

export const authenticateOptional = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authUser = await resolveUserFromRequest(req);
    if (authUser) {
      req.user = authUser;
    }
    return next();
  } catch {
    return next();
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
