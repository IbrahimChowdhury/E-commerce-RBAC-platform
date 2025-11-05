import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { generateToken, setTokenCookie, clearTokenCookie } from '../config/jwt';
import { registerSchema, loginSchema } from '../utils/validation';
import { z } from 'zod';
import { securityLogger, SecurityLogLevel, SecurityEventType } from '../middleware/securityLogger';

// Registration endpoint
export const register = async (req: Request, res: Response) => {
  try {
    // Log registration attempt
    securityLogger.log(
      SecurityLogLevel.INFO,
      SecurityEventType.AUTH_SUCCESS,
      'User registration attempt',
      req,
      {
        email: req.body.email,
        role: req.body.role || 'buyer'
      }
    );

    // Validate input data
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      // Log failed registration attempt
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.AUTH_FAILURE,
        'Registration failed: email already exists',
        req,
        {
          email: validatedData.email,
          reason: 'email_exists'
        },
        false
      );

      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user (password will be hashed by pre-save middleware)
    const newUser = new User({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      role: validatedData.role,
      isActive: true
    });

    await newUser.save();

    // Log successful registration
    securityLogger.log(
      SecurityLogLevel.AUDIT,
      SecurityEventType.AUTH_SUCCESS,
      'User registered successfully',
      req,
      {
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role
      }
    );

    // Generate JWT token
    const tokenPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role
    };
    
    const token = generateToken(tokenPayload);
    
    // Set token in cookie
    setTokenCookie(res, token);

    // Return success response (exclude password)
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation error
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.VALIDATION_FAILURE,
        'Registration validation failed',
        req,
        {
          email: req.body.email,
          validationErrors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        false
      );

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login endpoint
export const login = async (req: Request, res: Response) => {
  try {
    // Log login attempt
    securityLogger.log(
      SecurityLogLevel.INFO,
      SecurityEventType.AUTH_SUCCESS,
      'User login attempt',
      req,
      {
        email: req.body.email
      }
    );

    // Validate input data
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      // Log failed login - user not found
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.AUTH_FAILURE,
        'Login failed: user not found',
        req,
        {
          email: validatedData.email,
          reason: 'user_not_found'
        },
        false
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      // Log failed login - account deactivated
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.AUTH_FAILURE,
        'Login failed: account deactivated',
        req,
        {
          userId: user._id.toString(),
          email: user.email,
          reason: 'account_deactivated'
        },
        false
      );

      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      // Log failed login - invalid password
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.AUTH_FAILURE,
        'Login failed: invalid password',
        req,
        {
          userId: user._id.toString(),
          email: user.email,
          reason: 'invalid_password'
        },
        false
      );

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    
    const token = generateToken(tokenPayload);
    
    // Set token in cookie
    setTokenCookie(res, token);

    // Log successful login
    securityLogger.log(
      SecurityLogLevel.AUDIT,
      SecurityEventType.AUTH_SUCCESS,
      'User logged in successfully',
      req,
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      }
    );

    // Return success response (exclude password)
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log validation error
      securityLogger.log(
        SecurityLogLevel.WARNING,
        SecurityEventType.VALIDATION_FAILURE,
        'Login validation failed',
        req,
        {
          email: req.body.email,
          validationErrors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        false
      );

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
  try {
    // Log logout event
    securityLogger.log(
      SecurityLogLevel.AUDIT,
      SecurityEventType.AUTH_SUCCESS,
      'User logged out',
      req,
      req.user ? {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role
      } : undefined
    );

    // Clear the auth token cookie
    clearTokenCookie(res);
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Get current user endpoint
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user details from database
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};