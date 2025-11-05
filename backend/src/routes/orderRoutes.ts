import express from 'express';
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus 
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Create new order (buyers only)
router.post('/', authenticate, authorize('buyer'), createOrder);

// Get user orders (role-based filtering)
router.get('/', authenticate, getUserOrders);

// Get single order by order ID
router.get('/:id', authenticate, getOrderById);

// Update order status (sellers and admins only)
router.put('/:id/status', authenticate, authorize('seller', 'admin'), updateOrderStatus);

export default router;