import jwt from 'jsonwebtoken';
import { Response } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  
  return jwt.verify(token, secret) as JWTPayload;
};

// Cookie-based token storage utilities
export const setTokenCookie = (res: Response, token: string): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/'
  };

  res.cookie('auth_token', token, cookieOptions);
};

export const clearTokenCookie = (res: Response): void => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/'
  });
};

export const extractTokenFromCookie = (cookies: any): string | null => {
  return cookies?.auth_token || null;
};