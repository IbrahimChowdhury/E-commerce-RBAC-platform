# Configuration Setup Guide

This document explains how to configure MongoDB and Cloudinary for the e-commerce backend.

## Environment Variables

Copy `.env.example` to `.env` and update the following variables:

### Database Configuration
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
```
- For local development, use the default MongoDB URI
- For production, use your MongoDB Atlas connection string

### JWT Configuration
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```
- Use a strong, unique secret key for JWT signing
- Set appropriate token expiration time

### Cloudinary Configuration
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

To get Cloudinary credentials:
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard
3. Copy the Cloud Name, API Key, and API Secret

### Server Configuration
```
PORT=5000
NODE_ENV=development
```

## Configuration Files

### Database Connection (`src/config/database.ts`)
- Handles MongoDB connection using Mongoose
- Includes error handling and connection logging

### Cloudinary Setup (`src/config/cloudinary.ts`)
- Configures Cloudinary with environment variables
- Provides utility functions for:
  - Image upload with automatic optimization
  - PDF document upload
  - File deletion
  - Error handling

### JWT Configuration (`src/config/jwt.ts`)
- Token generation and verification functions
- Uses environment variables for secret and expiration

### Main Configuration (`src/config/index.ts`)
- Initializes all configurations
- Validates environment variables
- Provides configuration status logging

## Usage

The configuration is automatically initialized when the server starts:

```typescript
import { initializeConfig } from './config';

// This will:
// 1. Load environment variables
// 2. Validate required configurations
// 3. Connect to MongoDB
// 4. Configure Cloudinary
// 5. Log configuration status
await initializeConfig();
```

## File Upload Features

### Image Upload
- Supports: JPG, PNG, WebP
- Automatic optimization and resizing
- Stored in `products` folder by default

### PDF Upload
- Supports: PDF files
- Stored in `documents` folder by default
- Raw file type for document storage

### File Management
- All files stored on Cloudinary (not locally)
- Only Cloudinary URLs stored in database
- Automatic cleanup and deletion support

## Validation

The system includes automatic validation:
- Checks for required environment variables
- Warns about missing or placeholder values
- Logs configuration status on startup

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or connection string is correct
- Check network connectivity for Atlas connections

### Cloudinary Issues
- Verify API credentials are correct
- Check Cloudinary dashboard for usage limits
- Ensure proper file types and sizes

### Environment Variable Issues
- Check `.env` file exists and has correct values
- Restart server after changing environment variables
- Use validation utility to check configuration status