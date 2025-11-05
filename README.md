# 🛍️ E-Commerce Platform

A full-stack **e-commerce platform** built with **Next.js**, **Node.js (Express)**, and **MongoDB**.  
It includes **Admin**, **Seller**, and **Buyer** roles with complete authentication and product management features.

---

## 🌐 Deployment URLs

- **Frontend:** https://e-commerce-rbac-platform.appwrite.network/
- **Backend API:** https://e-commerce-rbac-platform-backend.vercel.app/

---

## 👥 Default Login Credentials

### 🛡️ Admin  
- **Email:** `admin@ecommerce.com`  
- **Password:** `admin123`

### 🏬 Sellers  
- **Email:** `techstore@example.com`  
  **Password:** `seller123`  
- **Email:** `fashion@example.com`  
  **Password:** `seller123`

### 🛒 Buyers  
- **Email:** `ahmed@example.com`  
  **Password:** `buyer123`  
- **Email:** `fatima@example.com`  
  **Password:** `buyer123`

---

## 📱 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user info |

---

### 🛍️ Products
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/products` | Get all products (filter, sort) |
| GET | `/api/products/:id` | Get product details |
| POST | `/api/products` | Add new product *(Seller only)* |
| PUT | `/api/products/:id` | Update product *(Seller only)* |
| DELETE | `/api/products/:id` | Delete product *(Seller only)* |

---

### 📦 Orders
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/orders` | Get user’s orders |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders` | Create order *(Buyer only)* |
| PUT | `/api/orders/:id/status` | Update order status *(Seller only)* |

---

### ⚙️ Admin Management
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/status` | Update user status |

---

## 🧾 Notes
- Make sure the frontend `.env.local` file contains:
