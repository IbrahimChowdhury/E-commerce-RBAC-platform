import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromCookie, JWTPayload } from '../config/jwt';
import User from '../models/User';
import { securityLogger, SecurityLogLevel, SecurityEventType, logUnauthorizedAccess } from './securityLogger';

// Extend Request interface to include user data
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

// Enhanced authentication middleware with security logging
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract token from cookie or Authorization header
        let token = extractTokenFromCookie(req.cookies);

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            // Log unauthorized access attempt
            securityLogger.log(
                SecurityLogLevel.WARNING,
                SecurityEventType.UNAUTHORIZED_ACCESS,
                'No authentication token provided',
                req,
                {
                    path: req.path,
                    method: req.method,
                    hasAuthHeader: !!req.headers.authorization,
                    hasCookie: !!req.cookies.token
                },
                false
            );

            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Check if user still exists and is active
        const user = await User.findById(decoded.userId);
        if (!user) {
            securityLogger.log(
                SecurityLogLevel.WARNING,
                SecurityEventType.UNAUTHORIZED_ACCESS,
                'Token references non-existent user',
                req,
                {
                    userId: decoded.userId,
                    tokenExp: decoded.exp
                },
                false
            );

            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        if (!user.isActive) {
            securityLogger.log(
                SecurityLogLevel.WARNING,
                SecurityEventType.UNAUTHORIZED_ACCESS,
                'Inactive user attempted access',
                req,
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role
                },
                false
            );

            return res.status(401).json({
                success: false,
                message: 'Access denied. Account is inactive.'
            });
        }

        // Add user data to request object
        req.user = decoded;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        
        securityLogger.log(
            SecurityLogLevel.WARNING,
            SecurityEventType.UNAUTHORIZED_ACCESS,
            'Token verification failed',
            req,
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                tokenPresent: !!req.headers.authorization || !!req.cookies.token
            },
            false
        );

        return res.status(401).json({
            success: false,
            message: 'Access denied. Invalid token.'
        });
    }
};

// Enhanced role-based authorization middleware with security logging
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            securityLogger.log(
                SecurityLogLevel.WARNING,
                SecurityEventType.UNAUTHORIZED_ACCESS,
                'Authorization check failed - no user in request',
                req,
                {
                    requiredRoles: roles,
                    path: req.path,
                    method: req.method
                },
                false
            );

            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        if (!roles.includes(req.user.role)) {
            securityLogger.log(
                SecurityLogLevel.WARNING,
                SecurityEventType.UNAUTHORIZED_ACCESS,
                `Insufficient permissions for ${req.user.role} accessing ${req.path}`,
                req,
                {
                    userRole: req.user.role,
                    requiredRoles: roles,
                    userId: req.user.userId,
                    path: req.path,
                    method: req.method
                },
                false
            );

            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        // Log successful authorization for sensitive roles
        if (roles.includes('admin')) {
            securityLogger.log(
                SecurityLogLevel.AUDIT,
                SecurityEventType.ADMIN_ACTION,
                `Admin access granted to ${req.path}`,
                req,
                {
                    action: `${req.method} ${req.path}`,
                    userId: req.user.userId
                }
            );
        }

        next();
    };
};

// Middleware to check if user is admin
export const requireAdmin = authorize('admin');

// Middleware to check if user is seller
export const requireSeller = authorize('seller');

// Middleware to check if user is buyer
export const requireBuyer = authorize('buyer');

// Middleware to check if user is seller or admin
export const requireSellerOrAdmin = authorize('seller', 'admin');

// Middleware to check if user is buyer or admin
export const requireBuyerOrAdmin = authorize('buyer', 'admin');

// Enhanced optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = extractTokenFromCookie(req.cookies);

        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (token) {
            try {
                const decoded = verifyToken(token);
                const user = await User.findById(decoded.userId);

                if (user && user.isActive) {
                    req.user = decoded;
                }
            } catch (error) {
                // Token is invalid, but we don't fail the request for optional auth
                console.log('Optional auth: Invalid token provided');
            }
        }

        next();
    } catch (error) {
        // Don't fail the request for optional auth
        next();
    }
};

// Middleware to verify resource ownership (user can only access their own resources)
export const requireOwnership = (userIdParam: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        const resourceUserId = req.params[userIdParam] || req.body[userIdParam] || req.query[userIdParam];
        
        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // User can only access their own resources
        if (req.user.userId !== resourceUserId) {
            securityLogger.log(
                SecurityLogLevel.WARNING,
                SecurityEventType.UNAUTHORIZED_ACCESS,
                'User attempted to access resource they do not own',
                req,
                {
                    userId: req.user.userId,
                    attemptedResourceUserId: resourceUserId,
                    path: req.path,
                    method: req.method
                },
                false
            );

            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }

        next();
    };
};

// Middleware to verify seller ownership of products
export const requireSellerOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not authenticated.'
            });
        }

        // Admin can access any product
        if (req.user.role === 'admin') {
            return next();
        }

        // For sellers, verify they own the product
        if (req.user.role === 'seller') {
            const productId = req.params.id || req.params.productId;
            
            if (productId) {
                const Product = require('../models/Product').default;
                const product = await Product.findById(productId);
                
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product not found.'
                    });
                }

                if (product.sellerId.toString() !== req.user.userId) {
                    securityLogger.log(
                        SecurityLogLevel.WARNING,
                        SecurityEventType.UNAUTHORIZED_ACCESS,
                        'Seller attempted to access product they do not own',
                        req,
                        {
                            sellerId: req.user.userId,
                            productId: productId,
                            productOwnerId: product.sellerId.toString(),
                            path: req.path,
                            method: req.method
                        },
                        false
                    );

                    return res.status(403).json({
                        success: false,
                        message: 'Access denied. You can only manage your own products.'
                    });
                }
            }
        }

        next();
    } catch (error) {
        console.error('Ownership verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying resource ownership.'
        });
    }
};

// Middleware for session timeout check
export const checkSessionTimeout = (timeoutMinutes: number = 30) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && req.user.iat) {
            const tokenAge = Date.now() / 1000 - req.user.iat;
            const timeoutSeconds = timeoutMinutes * 60;

            if (tokenAge > timeoutSeconds) {
                securityLogger.log(
                    SecurityLogLevel.INFO,
                    SecurityEventType.AUTH_FAILURE,
                    'Session timeout',
                    req,
                    {
                        userId: req.user.userId,
                        tokenAge: tokenAge,
                        timeoutSeconds: timeoutSeconds
                    },
                    false
                );

                return res.status(401).json({
                    success: false,
                    message: 'Session expired. Please login again.',
                    code: 'SESSION_TIMEOUT'
                });
            }
        }

        next();
    };
};