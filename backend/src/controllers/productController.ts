import { Request, Response } from 'express';
import Product, { IProduct } from '../models/Product';
import { 
  createProductSchema, 
  updateProductSchema, 
  productQuerySchema,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryInput
} from '../utils/validation';
// Using the extended Request interface from authMiddleware
import { JWTPayload } from '../config/jwt';

interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Get all products with filtering and search
export const getProducts = async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validatedQuery = productQuerySchema.parse(req.query);
    
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sellerId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = validatedQuery;

    // Build filter object
    const filter: any = { isActive: true };

    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Add price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Add seller filter
    if (sellerId) {
      filter.sellerId = sellerId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('seller', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        }
      },
      message: 'Products retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get products error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        error: error.issues?.[0]?.message || 'Validation failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products',
      error: error.message
    });
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, isActive: true })
      .populate('seller', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product',
      error: error.message
    });
  }
};

// Create new product (seller only)
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    // Validate input
    const validatedData: CreateProductInput = createProductSchema.parse(req.body);

    // Check if user is seller
    if (req.user?.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can create products'
      });
    }

    // Create product
    const product = new Product({
      ...validatedData,
      sellerId: req.user.userId,
      images: [], // Will be added via separate upload endpoint
      documents: [] // Will be added via separate upload endpoint
    });

    await product.save();

    // Populate seller info for response
    await product.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });

  } catch (error: any) {
    console.error('Create product error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product data',
        error: error.errors[0]?.message || 'Validation failed'
      });
    }

    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        error: firstError?.message || 'Validation failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product (seller only - own products)
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const validatedData: UpdateProductInput = updateProductSchema.parse(req.body);

    // Find product and check ownership
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (req.user?.role !== 'seller' || product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }

    // Update product
    Object.assign(product, validatedData);
    await product.save();

    // Populate seller info for response
    await product.populate('seller', 'name email');

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error: any) {
    console.error('Update product error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product data',
        error: error.errors[0]?.message || 'Validation failed'
      });
    }

    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0] as any;
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        error: firstError?.message || 'Validation failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product (seller only - own products)
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Find product and check ownership
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (req.user?.role !== 'seller' || product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get seller's own products
export const getSellerProducts = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is seller
    if (req.user?.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can access this endpoint'
      });
    }

    // Validate query parameters
    const validatedQuery = productQuerySchema.parse(req.query);
    
    const {
      search,
      category,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = validatedQuery;

    // Build filter object for seller's products
    const filter: any = { 
      sellerId: req.user.userId,
      isActive: true 
    };

    // Add search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Add category filter
    if (category) {
      filter.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        }
      },
      message: 'Seller products retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get seller products error:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        error: error.errors[0]?.message || 'Validation failed'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve seller products',
      error: error.message
    });
  }
};

// Upload product images to Cloudinary
export const uploadProductImages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Check if user is seller
    if (req.user?.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can upload product images'
      });
    }

    // Find product and check ownership
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload images to your own products'
      });
    }

    // Check if adding these images would exceed the limit
    if (product.images.length + files.length > 10) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload ${files.length} images. Maximum 10 images per product. Current: ${product.images.length}`
      });
    }

    // Upload images to Cloudinary from memory buffer
    const { uploadImage } = await import('../config/cloudinary');
    const uploadPromises = files.map(file => uploadImage(file.buffer, `products/${product._id}`));
    
    const uploadResults = await Promise.all(uploadPromises);

    // Add new image URLs to product
    const newImageUrls = uploadResults.map(result => result.secure_url);
    product.images.push(...newImageUrls);
    await product.save();

    // No cleanup needed with memory storage
    console.log(`${files.length} image(s) uploaded to Cloudinary successfully`);

    // Populate seller info for response
    await product.populate('seller', 'name email');

    res.status(200).json({
      success: true,
      data: product,
      message: `${files.length} image(s) uploaded successfully`
    });

  } catch (error: any) {
    console.error('Upload images error:', error);

    // No cleanup needed with memory storage

    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// Upload product documents (PDFs) to Cloudinary
export const uploadProductDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No documents provided'
      });
    }

    // Check if user is seller
    if (req.user?.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can upload product documents'
      });
    }

    // Find product and check ownership
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload documents to your own products'
      });
    }

    // Check if adding these documents would exceed the limit
    if (product.documents.length + files.length > 5) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload ${files.length} documents. Maximum 5 documents per product. Current: ${product.documents.length}`
      });
    }

    // Upload documents to Cloudinary from memory buffer
    const { uploadPDF } = await import('../config/cloudinary');
    const uploadPromises = files.map(file => uploadPDF(file.buffer, `documents/${product._id}`));
    
    const uploadResults = await Promise.all(uploadPromises);

    // Add new document URLs to product
    const newDocumentUrls = uploadResults.map(result => result.secure_url);
    product.documents.push(...newDocumentUrls);
    await product.save();

    // No cleanup needed with memory storage
    console.log(`${files.length} document(s) uploaded to Cloudinary successfully`);

    // Populate seller info for response
    await product.populate('seller', 'name email');

    res.status(200).json({
      success: true,
      data: product,
      message: `${files.length} document(s) uploaded successfully`
    });

  } catch (error: any) {
    console.error('Upload documents error:', error);

    // No cleanup needed with memory storage

    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: error.message
    });
  }
};

// Remove product image
export const removeProductImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    // Check if user is seller
    if (req.user?.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can remove product images'
      });
    }

    // Find product and check ownership
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove images from your own products'
      });
    }

    // Check if image exists in product
    const imageIndex = product.images.indexOf(imageUrl);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in product'
      });
    }

    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
    const publicId = publicIdWithExtension.split('.')[0]; // Remove extension

    // Delete from Cloudinary
    const { deleteFile } = await import('../config/cloudinary');
    await deleteFile(publicId, 'image');

    // Remove from product
    product.images.splice(imageIndex, 1);
    await product.save();

    // Populate seller info for response
    await product.populate('seller', 'name email');

    res.status(200).json({
      success: true,
      data: product,
      message: 'Image removed successfully'
    });

  } catch (error: any) {
    console.error('Remove image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove image',
      error: error.message
    });
  }
};

// Remove product document
export const removeProductDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({
        success: false,
        message: 'Document URL is required'
      });
    }

    // Check if user is seller
    if (req.user?.role !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can remove product documents'
      });
    }

    // Find product and check ownership
    const product = await Product.findOne({ _id: id, isActive: true });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (product.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove documents from your own products'
      });
    }

    // Check if document exists in product
    const documentIndex = product.documents.indexOf(documentUrl);
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found in product'
      });
    }

    // Extract public_id from Cloudinary URL
    const urlParts = documentUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
    const publicId = publicIdWithExtension.split('.')[0]; // Remove extension

    // Delete from Cloudinary
    const { deleteFile } = await import('../config/cloudinary');
    await deleteFile(publicId, 'raw');

    // Remove from product
    product.documents.splice(documentIndex, 1);
    await product.save();

    // Populate seller info for response
    await product.populate('seller', 'name email');

    res.status(200).json({
      success: true,
      data: product,
      message: 'Document removed successfully'
    });

  } catch (error: any) {
    console.error('Remove document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove document',
      error: error.message
    });
  }
};