import { Request, Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

// Get admin dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Get user counts by role
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalSellers = await User.countDocuments({ role: 'seller', isActive: true });
        const totalBuyers = await User.countDocuments({ role: 'buyer', isActive: true });
        const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });

        // Get product statistics
        const totalProducts = await Product.countDocuments({ isActive: true });
        const productsByCategory = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get order statistics
        const totalOrders = await Order.countDocuments();
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get recent orders (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentOrders = await Order.countDocuments({
            orderDate: { $gte: thirtyDaysAgo }
        });

        // Calculate total revenue (completed orders only)
        const revenueResult = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Get monthly order trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyOrders = await Order.aggregate([
            { $match: { orderDate: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$orderDate' },
                        month: { $month: '$orderDate' }
                    },
                    count: { $sum: 1 },
                    revenue: { 
                        $sum: { 
                            $cond: [
                                { $eq: ['$status', 'Completed'] },
                                '$totalAmount',
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    sellers: totalSellers,
                    buyers: totalBuyers,
                    admins: totalAdmins
                },
                products: {
                    total: totalProducts,
                    byCategory: productsByCategory
                },
                orders: {
                    total: totalOrders,
                    recent: recentOrders,
                    byStatus: ordersByStatus,
                    monthlyTrends: monthlyOrders
                },
                revenue: {
                    total: totalRevenue
                }
            },
            message: 'Dashboard statistics retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// Get all users for admin management
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, role, search, status } = req.query;
        
        // Build filter object
        const filter: any = {};
        
        if (role && role !== 'all') {
            filter.role = role;
        }
        
        if (status === 'active') {
            filter.isActive = true;
        } else if (status === 'inactive') {
            filter.isActive = false;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Get users with pagination
        const users = await User.find(filter)
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limitNum);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalUsers,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            },
            message: 'Users retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// Ban or unban a user
export const toggleUserBan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'ban' or 'unban'

        // Validate action
        if (!action || !['ban', 'unban'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "ban" or "unban"'
            });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from banning themselves
        if (user._id.toString() === req.user?.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot ban yourself'
            });
        }

        // Prevent banning other admins (optional security measure)
        if (user.role === 'admin' && action === 'ban') {
            return res.status(400).json({
                success: false,
                message: 'Cannot ban admin users'
            });
        }

        // Update user status
        const newStatus = action === 'ban' ? false : true;
        user.isActive = newStatus;
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isActive: user.isActive
            },
            message: `User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`
        });

    } catch (error) {
        console.error('Error toggling user ban:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

// Get user details by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get additional user statistics
        let userStats = {};
        
        if (user.role === 'seller') {
            const productCount = await Product.countDocuments({ sellerId: id, isActive: true });
            const orderCount = await Order.countDocuments({ sellerId: id });
            const completedOrders = await Order.countDocuments({ sellerId: id, status: 'Completed' });
            
            userStats = {
                totalProducts: productCount,
                totalOrders: orderCount,
                completedOrders
            };
        } else if (user.role === 'buyer') {
            const orderCount = await Order.countDocuments({ buyerId: id });
            const completedOrders = await Order.countDocuments({ buyerId: id, status: 'Completed' });
            
            userStats = {
                totalOrders: orderCount,
                completedOrders
            };
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: userStats
            },
            message: 'User details retrieved successfully'
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user details',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};