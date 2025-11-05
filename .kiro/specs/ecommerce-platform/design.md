# Design Document

## Overview

আমাদের ই-কমার্স প্ল্যাটফর্ম একটি সহজ এবং কার্যকর full-stack web application হবে। এটি Next.js 14+ App Router, TypeScript, এবং MongoDB দিয়ে তৈরি হবে। আমরা সবকিছু সহজ রাখব যাতে কোড বুঝতে এবং maintain করতে সুবিধা হয়।

### Technology Stack
- **Frontend:** Next.js 14+ with App Router, TypeScript, TailwindCSS
- **Backend:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT tokens
- **File Upload:** Cloudinary for image and PDF storage
- **File Handling:** Multer for temporary file processing
- **Validation:** Zod for schema validation

## Architecture

### Project Folder Structure
```
ecommerce-platform/
├── backend/               # Express.js Backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth & validation middleware
│   │   ├── utils/         # Helper functions
│   │   └── config/        # Database & app config
│   ├── uploads/           # File upload directory
│   └── package.json
│
└── frontend/              # Next.js Frontend
    ├── src/
    │   ├── app/           # Next.js App Router
    │   ├── components/    # UI components
    │   ├── lib/           # Frontend utilities
    │   └── types/         # TypeScript types
    └── package.json
```

### User Flow Architecture
1. **Authentication Flow:** Simple JWT-based auth with role checking
2. **Product Flow:** CRUD operations with Cloudinary image/PDF upload
3. **Order Flow:** Cart → Checkout → Order Management → Tracking
4. **Admin Flow:** User management and basic analytics

### Cloudinary Integration
- **Image Upload:** Product images uploaded to Cloudinary
- **PDF Upload:** Product documents (catalogs, manuals) uploaded to Cloudinary
- **URL Storage:** Only Cloudinary public URLs stored in database
- **File Types:** Images (jpg, png, webp) and PDFs supported
- **Configuration:** Cloudinary credentials in environment variables

## Components and Interfaces

### Core Models

#### User Model
```typescript
interface User {
  _id: string
  email: string
  password: string (hashed)
  name: string
  role: 'admin' | 'seller' | 'buyer'
  isActive: boolean
  createdAt: Date
}
```#### P
roduct Model
```typescript
interface Product {
  _id: string
  title: string
  description: string
  category: string
  price: number
  images: string[]        # Array of Cloudinary public URLs
  documents: string[]     # Array of PDF Cloudinary URLs (optional)
  sellerId: string        # Reference to User
  isActive: boolean
  createdAt: Date
}
```

#### Order Model
```typescript
interface Order {
  _id: string
  orderId: string         # Unique order identifier
  buyerId: string         # Reference to User
  sellerId: string        # Reference to User
  products: [{
    productId: string
    quantity: number
    price: number
  }]
  totalAmount: number
  status: 'Pending' | 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled'
  paymentMethod: 'Cash on Delivery'
  shippingAddress: string
  orderDate: Date
  statusHistory: [{
    status: string
    timestamp: Date
    updatedBy: string
  }]
}
```

### API Endpoints Design

#### Authentication APIs (Express Backend)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

#### Product APIs (Express Backend)
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller only)
- `PUT /api/products/:id` - Update product (seller only)
- `DELETE /api/products/:id` - Delete product (seller only)
- `POST /api/products/:id/images` - Upload product images to Cloudinary
- `POST /api/products/:id/documents` - Upload product PDFs to Cloudinary

#### Order APIs (Express Backend)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (seller only)

#### Admin APIs (Express Backend)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `GET /api/admin/stats` - Get platform statistics## Data M
odels

### Database Schema Design

আমরা MongoDB ব্যবহার করব কারণ এটি সহজ এবং flexible। Mongoose দিয়ে schema define করব।

#### User Schema
```javascript
const userSchema = {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seller', 'buyer'], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

#### Product Schema
```javascript
const productSchema = {
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],        // Cloudinary public URLs
  documents: [{ type: String }],     // PDF Cloudinary URLs (optional)
  sellerId: { type: ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

#### Order Schema
```javascript
const orderSchema = {
  orderId: { type: String, unique: true, required: true },
  buyerId: { type: ObjectId, ref: 'User', required: true },
  sellerId: { type: ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  shippingAddress: { type: String, required: true },
  orderDate: { type: Date, default: Date.now },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: ObjectId, ref: 'User' }
  }]
}
```## Error
 Handling

### Simple Error Handling Strategy

আমরা একটি সহজ error handling system ব্যবহার করব:

1. **API Level:** সব API route এ try-catch block
2. **Frontend Level:** Error boundaries এবং toast notifications
3. **Validation Level:** Zod schema validation
4. **Database Level:** Mongoose validation errors

### Error Response Format
```typescript
interface ErrorResponse {
  success: false
  message: string
  error?: string
}

interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}
```

### Common Error Scenarios
- Invalid credentials → 401 Unauthorized
- Missing permissions → 403 Forbidden  
- Resource not found → 404 Not Found
- Validation errors → 400 Bad Request
- Server errors → 500 Internal Server Error

## Testing Strategy

### Simple Testing Approach

যেহেতু আমরা সহজ রাখতে চাই, তাই basic testing করব:

1. **Manual Testing:** প্রতিটি feature manually test করব
2. **API Testing:** Postman দিয়ে API endpoints test করব
3. **Frontend Testing:** Browser এ different scenarios test করব
4. **Database Testing:** MongoDB Compass দিয়ে data verify করব

### Test Cases Priority
1. **Authentication:** Login/Register/Logout
2. **Product CRUD:** Create, Read, Update, Delete products
3. **Order Flow:** Add to cart → Checkout → Order management
4. **Role-based Access:** Admin/Seller/Buyer permissions
5. **File Upload:** Image upload এবং display

### Testing Environment
- **Development:** Local MongoDB এবং Next.js dev server
- **Production:** Deployed version এ final testing