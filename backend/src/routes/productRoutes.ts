import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  uploadProductImages,
  uploadProductDocuments,
  removeProductImage,
  removeProductDocument
} from '../controllers/productController';
import { authenticate } from '../middleware/authMiddleware';
import { 
  uploadImages, 
  uploadDocuments, 
  handleMulterError 
} from '../middleware/uploadMiddleware';
import { 
  validateBody, 
  validateQuery, 
  validateParams,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  idParamSchema
} from '../utils/validation';

const router = express.Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), getProducts);     // GET /api/products - Get all products with filtering

// Seller-specific routes (MUST be before /:id route to avoid conflict)
router.get('/seller/my-products', authenticate, validateQuery(productQuerySchema), getSellerProducts);  // GET /api/products/seller/my-products - Get seller's products

// Public route for single product (MUST be after specific routes)
router.get('/:id', validateParams(idParamSchema), getProductById); // GET /api/products/:id - Get single product

// Protected routes (require authentication)
router.post('/', authenticate, validateBody(createProductSchema), createProduct);           // POST /api/products - Create product (seller only)
router.put('/:id', authenticate, validateParams(idParamSchema), validateBody(updateProductSchema), updateProduct);         // PUT /api/products/:id - Update product (seller only)
router.delete('/:id', authenticate, validateParams(idParamSchema), deleteProduct);      // DELETE /api/products/:id - Delete product (seller only)

// File upload routes (require authentication)
router.post('/:id/images', authenticate, validateParams(idParamSchema), uploadImages, uploadProductImages);        // POST /api/products/:id/images - Upload product images
router.post('/:id/documents', authenticate, validateParams(idParamSchema), uploadDocuments, uploadProductDocuments); // POST /api/products/:id/documents - Upload product documents

// File removal routes (require authentication)
router.delete('/:id/images', authenticate, validateParams(idParamSchema), removeProductImage);     // DELETE /api/products/:id/images - Remove product image
router.delete('/:id/documents', authenticate, validateParams(idParamSchema), removeProductDocument); // DELETE /api/products/:id/documents - Remove product document

// Error handling middleware for multer
router.use(handleMulterError);

export default router;