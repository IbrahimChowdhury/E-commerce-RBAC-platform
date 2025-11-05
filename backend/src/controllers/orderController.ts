import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Order, { IOrder, IOrderProduct } from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';

// Extend Request interface to include user data
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

// Create new order
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { products, totalAmount, shippingAddress, customerInfo, paymentMethod } = req.body;
    const buyerId = req.user?.userId;

    if (!buyerId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Products are required'
      });
      return;
    }

    if (!totalAmount || totalAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Valid total amount is required'
      });
      return;
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
      return;
    }

    // Verify buyer exists and has buyer role
    const buyer = await User.findById(buyerId);
    if (!buyer || buyer.role !== 'buyer') {
      res.status(403).json({
        success: false,
        message: 'Only buyers can create orders'
      });
      return;
    }

    // Validate and process products
    const validatedProducts: IOrderProduct[] = [];
    let calculatedTotal = 0;
    let sellerId: string | null = null;

    for (const item of products) {
      const { productId, quantity, price } = item;

      if (!productId || !quantity || quantity <= 0 || !price || price <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid product data'
        });
        return;
      }

      // Verify product exists and is active
      const product = await Product.findById(productId).populate('sellerId');
      if (!product || !product.isActive) {
        res.status(400).json({
          success: false,
          message: `Product ${productId} not found or inactive`
        });
        return;
      }

      // Verify price matches current product price
      if (product.price !== price) {
        res.status(400).json({
          success: false,
          message: `Price mismatch for product ${product.title}`
        });
        return;
      }

      // For simplicity, we'll assume all products in one order are from the same seller
      // In a real marketplace, you'd need to split orders by seller
      if (!sellerId) {
        sellerId = product.sellerId.toString();
      } else if (sellerId !== product.sellerId.toString()) {
        res.status(400).json({
          success: false,
          message: 'All products in an order must be from the same seller'
        });
        return;
      }

      validatedProducts.push({
        productId: new mongoose.Types.ObjectId(product._id),
        quantity,
        price
      });

      calculatedTotal += price * quantity;
    }

    // Verify calculated total matches provided total
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      res.status(400).json({
        success: false,
        message: 'Total amount mismatch'
      });
      return;
    }

    // Create the order
    const newOrder = new Order({
      buyerId,
      sellerId,
      products: validatedProducts,
      totalAmount: calculatedTotal,
      shippingAddress: shippingAddress.trim(),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      status: 'Pending'
    });

    const savedOrder = await newOrder.save();

    // Populate order with buyer and seller info
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .populate('products.productId', 'title images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get user orders (buyer or seller)
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    let query: any = {};
    
    // Filter orders based on user role
    if (userRole === 'buyer') {
      query.buyerId = userId;
    } else if (userRole === 'seller') {
      query.sellerId = userId;
    } else if (userRole === 'admin') {
      // Admin can see all orders - no filter needed
    } else {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
      return;
    }

    const orders = await Order.find(query)
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .populate('products.productId', 'title images price')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      data: orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get single order by ID
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const order = await Order.findOne({ orderId: id })
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .populate('products.productId', 'title images price description');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check if user has permission to view this order
    const canView = userRole === 'admin' || 
                   order.buyerId._id.toString() === userId || 
                   order.sellerId._id.toString() === userId;

    if (!canView) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order'
      });
      return;
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update order status (seller only)
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check if user has permission to update this order
    const canUpdate = userRole === 'admin' || 
                     (userRole === 'seller' && order.sellerId.toString() === userId);

    if (!canUpdate) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order'
      });
      return;
    }

    // Update order status
    order.status = status as any;
    
    // Add status change to history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: userId as any
    });

    const updatedOrder = await order.save();

    // Populate and return updated order
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .populate('products.productId', 'title images price');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: populatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};