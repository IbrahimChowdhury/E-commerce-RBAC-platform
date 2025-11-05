import { z } from 'zod';

// Enhanced User validation schemas
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .trim(),
  role: z.enum(['seller', 'buyer'])
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
});

// Enhanced Product validation schemas
export const createProductSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-.,!?()]+$/, 'Title contains invalid characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim(),
  category: z.enum([
    'Electronics',
    'Clothing', 
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Automotive',
    'Food',
    'Toys',
    'Other'
  ]),
  price: z.number()
    .min(0.01, 'Price must be at least $0.01')
    .max(1000000, 'Price cannot exceed $1,000,000')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock cannot exceed 10,000')
    .optional()
    .default(0)
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  search: z.string()
    .max(100, 'Search term too long')
    .regex(/^[a-zA-Z0-9\s\-.,!?()]*$/, 'Search contains invalid characters')
    .optional(),
  category: z.string()
    .max(50, 'Category name too long')
    .optional(),
  minPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(val => val ? parseFloat(val) : undefined)
    .optional(),
  maxPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(val => val ? parseFloat(val) : undefined)
    .optional(),
  sellerId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid seller ID format')
    .optional(),
  page: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .pipe(z.number().int().min(1, 'Page must be at least 1'))
    .optional()
    .default(1),
  limit: z.union([z.string(), z.number()])
    .transform(val => typeof val === 'string' ? parseInt(val) : val)
    .pipe(z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit must be between 1 and 100'))
    .optional()
    .default(10),
  sortBy: z.enum(['price', 'createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
      quantity: z.number()
        .int('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity cannot exceed 100'),
      price: z.number()
        .min(0.01, 'Price must be positive')
        .max(1000000, 'Price too high')
    })
  ).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    street: z.string()
      .min(5, 'Street address must be at least 5 characters')
      .max(100, 'Street address too long')
      .trim(),
    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'City contains invalid characters')
      .trim(),
    state: z.string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'State contains invalid characters')
      .trim(),
    zipCode: z.string()
      .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
      .trim(),
    country: z.string()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'Country contains invalid characters')
      .trim()
  }),
  paymentMethod: z.enum(['cash_on_delivery', 'credit_card', 'paypal'])
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'Pending',
    'Processing',
    'Out for Delivery',
    'Completed',
    'Cancelled',
    'Rejected'
  ]),
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
});

// Admin validation schemas
export const adminUserQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(val => val ? parseInt(val) : 1)
    .refine(val => val >= 1, 'Page must be at least 1')
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(val => val ? parseInt(val) : 10)
    .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
    .optional(),
  role: z.enum(['all', 'admin', 'seller', 'buyer']).optional(),
  search: z.string()
    .max(100, 'Search term too long')
    .regex(/^[a-zA-Z0-9\s@.\-_]*$/, 'Search contains invalid characters')
    .optional(),
  status: z.enum(['all', 'active', 'inactive']).optional()
});

export const banUserSchema = z.object({
  action: z.enum(['ban', 'unban'])
});

// File upload validation
export const fileUploadSchema = z.object({
  originalname: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9\s\-._()]+\.[a-zA-Z]{2,5}$/, 'Invalid filename format'),
  mimetype: z.string()
    .refine(
      (type) => [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'application/pdf'
      ].includes(type),
      'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed'
    ),
  size: z.number()
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB')
});

// MongoDB ObjectId validation
export const objectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// ID parameter validation schema
export const idParamSchema = z.object({
  id: objectIdSchema
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10)
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;

// Validation middleware factory
export const validateBody = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Query validation middleware factory
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Query validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Params validation middleware factory
export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Parameter validation failed',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};