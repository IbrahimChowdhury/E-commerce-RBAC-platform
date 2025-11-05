import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileUploadSchema } from '../utils/validation';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sanitize filename to prevent directory traversal and other attacks
const sanitizeFilename = (filename: string): string => {
  // Remove path components and unsafe characters
  const basename = path.basename(filename);
  return basename
    .replace(/[^a-zA-Z0-9\-._]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 100); // Limit length
};

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate secure unique filename
    const sanitizedName = sanitizeFilename(file.originalname);
    const extension = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, extension);
    
    // Add timestamp and random string for uniqueness
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const uniqueName = `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
    
    cb(null, uniqueName);
  }
});

// Enhanced file filter function with security checks
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // First validate using Zod schema
    fileUploadSchema.parse({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size || 0 // Size might not be available at this point
    });

    // Additional checks based on field name
    if (file.fieldname === 'images') {
      // Strict image validation
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      
      const fileExtension = path.extname(file.originalname).toLowerCase();
      
      if (!allowedImageTypes.includes(file.mimetype) || !allowedImageExtensions.includes(fileExtension)) {
        return cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
      }
      
      // Check for potential malicious filenames
      if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        return cb(new Error('Invalid filename detected'));
      }
      
      cb(null, true);
    } else if (file.fieldname === 'documents') {
      // Strict PDF validation
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed for documents'));
      }
      
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (fileExtension !== '.pdf') {
        return cb(new Error('File extension must be .pdf'));
      }
      
      // Check for potential malicious filenames
      if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        return cb(new Error('Invalid filename detected'));
      }
      
      cb(null, true);
    } else {
      cb(new Error('Invalid field name. Only "images" and "documents" are allowed'));
    }
  } catch (error) {
    if (error instanceof Error) {
      cb(new Error(`File validation failed: ${error.message}`));
    } else {
      cb(new Error('File validation failed'));
    }
  }
};

// Create multer instance with enhanced security
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files per request
    fields: 10, // Maximum 10 non-file fields
    parts: 20, // Maximum 20 parts (files + fields)
    fieldNameSize: 100, // Maximum field name size
    fieldSize: 1024 * 1024, // Maximum field value size (1MB)
    headerPairs: 2000 // Maximum header pairs
  }
});

// Middleware for uploading images with additional validation
export const uploadImages = (req: any, res: any, next: any) => {
  const uploadMiddleware = upload.array('images', 10);
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // Additional server-side validation for uploaded files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          // Validate each file against our schema
          fileUploadSchema.parse({
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          
          // Check file content (magic bytes) for images
          const fileBuffer = fs.readFileSync(file.path);
          if (!isValidImageFile(fileBuffer, file.mimetype)) {
            // Clean up the invalid file
            fs.unlinkSync(file.path);
            return res.status(400).json({
              success: false,
              message: `Invalid image file: ${file.originalname}. File content doesn't match the declared type.`
            });
          }
        } catch (error) {
          // Clean up the invalid file
          fs.unlinkSync(file.path);
          return res.status(400).json({
            success: false,
            message: `File validation failed for ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    }
    
    next();
  });
};

// Middleware for uploading documents with additional validation
export const uploadDocuments = (req: any, res: any, next: any) => {
  const uploadMiddleware = upload.array('documents', 5);
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // Additional server-side validation for uploaded files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          // Validate each file against our schema
          fileUploadSchema.parse({
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          });
          
          // Check file content (magic bytes) for PDFs
          const fileBuffer = fs.readFileSync(file.path);
          if (!isValidPDFFile(fileBuffer)) {
            // Clean up the invalid file
            fs.unlinkSync(file.path);
            return res.status(400).json({
              success: false,
              message: `Invalid PDF file: ${file.originalname}. File content doesn't match PDF format.`
            });
          }
        } catch (error) {
          // Clean up the invalid file
          fs.unlinkSync(file.path);
          return res.status(400).json({
            success: false,
            message: `File validation failed for ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    }
    
    next();
  });
};

// Helper function to validate image files by checking magic bytes
const isValidImageFile = (fileBuffer: Buffer, mimetype: string): boolean => {
  if (fileBuffer.length < 4) return false;
  
  const header = fileBuffer.toString('hex', 0, 4).toUpperCase();
  
  switch (mimetype) {
    case 'image/jpeg':
    case 'image/jpg':
      return header.startsWith('FFD8');
    case 'image/png':
      return header.startsWith('89504E47');
    case 'image/webp':
      // WebP files start with "RIFF" and contain "WEBP"
      if (fileBuffer.length < 12) return false;
      const riffHeader = fileBuffer.toString('ascii', 0, 4);
      const webpHeader = fileBuffer.toString('ascii', 8, 12);
      return riffHeader === 'RIFF' && webpHeader === 'WEBP';
    default:
      return false;
  }
};

// Helper function to validate PDF files by checking magic bytes
const isValidPDFFile = (fileBuffer: Buffer): boolean => {
  if (fileBuffer.length < 4) return false;
  
  // PDF files start with "%PDF"
  const header = fileBuffer.toString('ascii', 0, 4);
  return header === '%PDF';
};

// Cleanup function to delete temporary files
export const cleanupTempFiles = (files: Express.Multer.File[]) => {
  files.forEach(file => {
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error('Error deleting temp file:', file.path, error);
    }
  });
};

// Enhanced error handling middleware for multer
export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum 10 files allowed.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name in file upload.';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in the request.';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long.';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long.';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields.';
        break;
      default:
        message = error.message || 'File upload error';
    }
    
    return res.status(400).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  next(error);
};

// Security middleware to scan for malicious content (basic implementation)
export const scanUploadedFiles = (req: any, res: any, next: any) => {
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      // Basic security checks
      const fileBuffer = fs.readFileSync(file.path);
      
      // Check for common malicious patterns (very basic)
      const fileContent = fileBuffer.toString('ascii').toLowerCase();
      const maliciousPatterns = [
        '<script>',
        'javascript:',
        'vbscript:',
        'onload=',
        'onerror=',
        'eval(',
        'document.cookie'
      ];
      
      for (const pattern of maliciousPatterns) {
        if (fileContent.includes(pattern)) {
          // Clean up the malicious file
          fs.unlinkSync(file.path);
          return res.status(400).json({
            success: false,
            message: `Potentially malicious content detected in file: ${file.originalname}`
          });
        }
      }
    }
  }
  
  next();
};