# E-Commerce Platform

A full-stack e-commerce platform built with Next.js, TypeScript, Node.js, Express, and MongoDB. This platform supports three user roles: Admin, Seller, and Buyer with comprehensive features for product management, order processing, and user management.

## 🚀 Features

### User Authentication & Authorization
- ✅ Role-based authentication (Admin, Seller, Buyer)
- ✅ Secure JWT-based sessions
- ✅ Input validation and sanitization
- ✅ Password strength requirements

### Product Management (Sellers)
- ✅ Add, edit, and delete products
- ✅ Multiple image uploads with Cloudinary integration
- ✅ Category-based organization
- ✅ Real-time inventory management
- ✅ Product status management (active/inactive)

### Shopping Experience (Buyers)
- ✅ Browse products with advanced filtering
- ✅ Search functionality
- ✅ Product categories and sorting
- ✅ Shopping cart functionality
- ✅ Secure checkout process
- ✅ Order history and tracking

### Order Management
- ✅ Order creation and processing
- ✅ Status tracking (Pending → Processing → Out for Delivery → Completed)
- ✅ Order history for buyers and sellers
- ✅ Order cancellation and refund handling

### Admin Panel
- ✅ User management (view, ban, activate users)
- ✅ Platform statistics and analytics
- ✅ Order oversight and management
- ✅ System-wide product monitoring

### Security & Validation
- ✅ Comprehensive input validation
- ✅ File upload security
- ✅ Rate limiting and security headers
- ✅ Error handling and logging
- ✅ Role-based access control

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **React Hook Form** - Efficient form handling
- **Zod** - Schema validation
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type safety for backend
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage and optimization
- **Multer** - File upload handling

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Cloudinary account for image storage
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ecommerce-platform
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment variables
cp .env.example .env.local

# Edit .env.local with your configuration:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start the development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 Default Login Credentials

After running the seed script, you can use these credentials:

### Admin
- **Email:** admin@ecommerce.com
- **Password:** admin123

### Sellers
- **Email:** techstore@example.com
- **Password:** seller123
- **Email:** fashion@example.com
- **Password:** seller123

### Buyers
- **Email:** ahmed@example.com
- **Password:** buyer123
- **Email:** fatima@example.com
- **Password:** buyer123

## 📁 Project Structure

```
ecommerce-platform/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and API clients
│   └── public/              # Static assets
├── backend/                 # Express.js backend application
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   ├── utils/           # Utility functions
│   │   └── scripts/         # Database scripts
│   └── uploads/             # Temporary file uploads
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key-here
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Database Setup

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/ecommerce`

#### Option 2: MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a cluster and database
3. Get the connection string and update MONGODB_URI

### Cloudinary Setup
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the environment variables

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller only)
- `PUT /api/products/:id` - Update product (Seller only)
- `DELETE /api/products/:id` - Delete product (Seller only)

### Order Endpoints
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (Buyer only)
- `PUT /api/orders/:id/status` - Update order status (Seller only)

### User Management (Admin)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status

## 🧪 Testing

### Running the Application
1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend server: `cd frontend && npm run dev`
3. Open http://localhost:3000 in your browser

### Testing User Flows
1. **Registration & Login:** Test user registration and login for different roles
2. **Product Management:** As a seller, add, edit, and manage products
3. **Shopping Experience:** As a buyer, browse products, add to cart, and checkout
4. **Order Processing:** Test the complete order flow from creation to completion
5. **Admin Functions:** As an admin, manage users and view platform statistics

## 🔒 Security Features

- JWT-based authentication with secure cookies
- Password hashing with bcrypt
- Input validation and sanitization
- File upload security with type and size validation
- Rate limiting on sensitive endpoints
- CORS configuration
- Error handling without information leakage
- Role-based access control

## 📈 Performance Optimizations

- Database indexing for better query performance
- Image optimization with Cloudinary
- Frontend code splitting with Next.js
- API response caching where appropriate
- Efficient database queries with population
- Lazy loading of images and components

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in .env
   - Verify network connectivity for Atlas

2. **Cloudinary Upload Errors**
   - Verify Cloudinary credentials
   - Check file size and type restrictions
   - Ensure proper network connectivity

3. **JWT Authentication Issues**
   - Check JWT_SECRET is set correctly
   - Verify token expiration settings
   - Clear browser cookies if needed

4. **CORS Errors**
   - Ensure frontend and backend URLs are correct
   - Check CORS configuration in backend
   - Verify environment variables

### Getting Help

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MongoDB and other services are running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Future Enhancements

- Payment gateway integration (Stripe, PayPal)
- Email notifications for orders
- Advanced search with Elasticsearch
- Product reviews and ratings
- Wishlist functionality
- Mobile app with React Native
- Real-time chat support
- Advanced analytics dashboard
- Multi-language support
- Social media authentication
