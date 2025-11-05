import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../utils/validation';
import { registerSchema, loginSchema } from '../utils/validation';

const router = express.Router();

// POST /api/auth/register - with validation
router.post('/register', validateBody(registerSchema), register);

// POST /api/auth/login - with validation
router.post('/login', validateBody(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', authenticate, getCurrentUser);

export default router;