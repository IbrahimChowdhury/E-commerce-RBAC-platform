import { z } from 'zod';

// Shared validation schemas for frontend
export const registerSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  role: z.enum(['seller', 'buyer'])
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
});

export const createProductSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-.,!?()]+$/, 'Title contains invalid characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
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
    .max(1000000, 'Price cannot exceed $1,000,000'),
  stock: z.number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock cannot exceed 10,000')
    .optional()
    .default(0)
});

export const updateProductSchema = createProductSchema.partial();

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number()
        .int('Quantity must be a whole number')
        .min(1, 'Quantity must be at least 1')
        .max(100, 'Quantity cannot exceed 100'),
      price: z.number()
        .min(0.01, 'Price must be positive')
    })
  ).min(1, 'Order must contain at least one item'),
  shippingAddress: z.object({
    street: z.string()
      .min(5, 'Street address must be at least 5 characters')
      .max(100, 'Street address too long'),
    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'City contains invalid characters'),
    state: z.string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'State contains invalid characters'),
    zipCode: z.string()
      .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    country: z.string()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country name too long')
      .regex(/^[a-zA-Z\s\-']+$/, 'Country contains invalid characters')
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

// File validation
export const imageFileSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  type: z.string().refine(
    (type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type),
    'Only JPEG, PNG, and WebP images are allowed'
  )
});

export const pdfFileSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  type: z.string().refine(
    (type) => type === 'application/pdf',
    'Only PDF files are allowed'
  )
});

// Search and filter schemas
export const productSearchSchema = z.object({
  search: z.string()
    .max(100, 'Search term too long')
    .regex(/^[a-zA-Z0-9\s\-.,!?()]*$/, 'Search contains invalid characters')
    .optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z.enum(['price', 'createdAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type ImageFileInput = z.infer<typeof imageFileSchema>;
export type PdfFileInput = z.infer<typeof pdfFileSchema>;
export type ProductSearchInput = z.infer<typeof productSearchSchema>;

// Utility function to validate files
export const validateFiles = (files: File[], schema: z.ZodSchema) => {
  const errors: string[] = [];
  const validFiles: File[] = [];

  files.forEach((file, index) => {
    try {
      schema.parse({
        name: file.name,
        size: file.size,
        type: file.type
      });
      validFiles.push(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fileErrors = error.issues.map(issue => 
          `File ${index + 1} (${file.name}): ${issue.message}`
        );
        errors.push(...fileErrors);
      }
    }
  });

  return { validFiles, errors };
};

// Utility function to sanitize filename
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\-._]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 100);
};