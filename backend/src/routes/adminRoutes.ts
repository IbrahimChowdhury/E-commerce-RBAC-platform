import express from 'express';
import { 
    getDashboardStats, 
    getAllUsers, 
    toggleUserBan, 
    getUserById 
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { 
    validateQuery, 
    validateParams, 
    validateBody,
    adminUserQuerySchema,
    idParamSchema,
    banUserSchema
} from '../utils/validation';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/admin/users - Get all users with pagination and filtering
router.get('/users', validateQuery(adminUserQuerySchema), getAllUsers);

// GET /api/admin/users/:id - Get user details by ID
router.get('/users/:id', validateParams(idParamSchema), getUserById);

// PUT /api/admin/users/:id/ban - Ban or unban a user
router.put('/users/:id/ban', validateParams(idParamSchema), validateBody(banUserSchema), toggleUserBan);

export default router;