import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create Admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123', // Plain text - will be hashed by pre-save hook
      role: 'admin'
    });

    // Create Sellers
    console.log('Creating seller users...');
    const sellers = await User.create([
      {
        name: 'Tech Store BD',
        email: 'techstore@example.com',
        password: 'seller123', // Plain text - will be hashed by pre-save hook
        role: 'seller'
      },
      {
        name: 'Fashion House',
        email: 'fashion@example.com',
        password: 'seller123', // Plain text - will be hashed by pre-save hook
        role: 'seller'
      },
      {
        name: 'Book Corner',
        email: 'books@example.com',
        password: 'seller123', // Plain text - will be hashed by pre-save hook
        role: 'seller'
      },
      {
        name: 'Home & Garden Shop',
        email: 'homeandgarden@example.com',
        password: 'seller123', // Plain text - will be hashed by pre-save hook
        role: 'seller'
      }
    ]);

    // Create Buyers
    console.log('Creating buyer users...');
    const buyers = await User.create([
      {
        name: 'Ahmed Rahman',
        email: 'ahmed@example.com',
        password: 'buyer123', // Plain text - will be hashed by pre-save hook
        role: 'buyer'
      },
      {
        name: 'Fatima Khan',
        email: 'fatima@example.com',
        password: 'buyer123', // Plain text - will be hashed by pre-save hook
        role: 'buyer'
      },
      {
        name: 'Karim Hassan',
        email: 'karim@example.com',
        password: 'buyer123', // Plain text - will be hashed by pre-save hook
        role: 'buyer'
      }
    ]);

    // Sample product images (using placeholder images)
    const sampleImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
    ];

    // Create Products
    console.log('Creating products...');
    const products = await Product.create([
      // Electronics products
      {
        title: 'iPhone 15 Pro',
        description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Perfect for photography and gaming.',
        category: 'Electronics',
        price: 120000,
        images: [sampleImages[0], sampleImages[1]],
        sellerId: sellers[0]._id,
        isActive: true
      },
      {
        title: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features. Perfect for productivity.',
        category: 'Electronics',
        price: 110000,
        images: [sampleImages[1], sampleImages[0]],
        sellerId: sellers[0]._id,
        isActive: true
      },
      {
        title: 'MacBook Air M3',
        description: 'Ultra-thin laptop with M3 chip, 18-hour battery life, and stunning Retina display.',
        category: 'Electronics',
        price: 150000,
        images: [sampleImages[2], sampleImages[3]],
        sellerId: sellers[0]._id,
        isActive: true
      },
      {
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation, 30-hour battery, crystal clear calls.',
        category: 'Electronics',
        price: 35000,
        images: [sampleImages[3], sampleImages[4]],
        sellerId: sellers[0]._id,
        isActive: true
      },

      // Clothing products
      {
        title: 'Premium Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors. Perfect for daily wear.',
        category: 'Clothing',
        price: 1200,
        images: [sampleImages[0], sampleImages[2]],
        sellerId: sellers[1]._id,
        isActive: true
      },
      {
        title: 'Denim Jeans',
        description: 'High-quality denim jeans with perfect fit. Available in multiple sizes.',
        category: 'Clothing',
        price: 2500,
        images: [sampleImages[1], sampleImages[3]],
        sellerId: sellers[1]._id,
        isActive: true
      },
      {
        title: 'Formal Shirt',
        description: 'Professional formal shirt for office wear. Wrinkle-free fabric.',
        category: 'Clothing',
        price: 1800,
        images: [sampleImages[2], sampleImages[4]],
        sellerId: sellers[1]._id,
        isActive: true
      },
      {
        title: 'Winter Jacket',
        description: 'Warm winter jacket with water-resistant outer layer.',
        category: 'Clothing',
        price: 4500,
        images: [sampleImages[3], sampleImages[0]],
        sellerId: sellers[1]._id,
        isActive: true
      },

      // Books
      {
        title: 'Learn JavaScript',
        description: 'Comprehensive guide to JavaScript programming. Perfect for beginners and intermediate developers.',
        category: 'Books',
        price: 800,
        images: [sampleImages[4], sampleImages[1]],
        sellerId: sellers[2]._id,
        isActive: true
      },
      {
        title: 'React Development Handbook',
        description: 'Master React.js with practical examples and real-world projects.',
        category: 'Books',
        price: 1200,
        images: [sampleImages[0], sampleImages[3]],
        sellerId: sellers[2]._id,
        isActive: true
      },
      {
        title: 'Data Structures & Algorithms',
        description: 'Essential computer science concepts with Python implementations.',
        category: 'Books',
        price: 1500,
        images: [sampleImages[1], sampleImages[4]],
        sellerId: sellers[2]._id,
        isActive: true
      },

      // Home & Garden
      {
        title: 'Indoor Plant Set',
        description: 'Beautiful set of 5 indoor plants perfect for home decoration and air purification.',
        category: 'Home & Garden',
        price: 2200,
        images: [sampleImages[2], sampleImages[0]],
        sellerId: sellers[3]._id,
        isActive: true
      },
      {
        title: 'LED Table Lamp',
        description: 'Modern LED table lamp with adjustable brightness and USB charging port.',
        category: 'Home & Garden',
        price: 1800,
        images: [sampleImages[3], sampleImages[1]],
        sellerId: sellers[3]._id,
        isActive: true
      },
      {
        title: 'Ceramic Dinner Set',
        description: '12-piece ceramic dinner set for 4 people. Dishwasher safe.',
        category: 'Home & Garden',
        price: 3500,
        images: [sampleImages[4], sampleImages[2]],
        sellerId: sellers[3]._id,
        isActive: true
      },

      // Sports & Toys
      {
        title: 'Cricket Bat',
        description: 'Professional cricket bat made from premium English willow.',
        category: 'Sports',
        price: 4500,
        images: [sampleImages[0], sampleImages[4]],
        sellerId: sellers[0]._id,
        isActive: true
      },
      {
        title: 'Football',
        description: 'Official size football with excellent grip and durability.',
        category: 'Sports',
        price: 1200,
        images: [sampleImages[1], sampleImages[0]],
        sellerId: sellers[0]._id,
        isActive: true
      },

      // Beauty & Automotive
      {
        title: 'Skincare Set',
        description: 'Complete skincare routine with cleanser, toner, and moisturizer.',
        category: 'Beauty',
        price: 2800,
        images: [sampleImages[2], sampleImages[3]],
        sellerId: sellers[1]._id,
        isActive: true
      },
      {
        title: 'Car Phone Holder',
        description: 'Universal car phone holder with 360-degree rotation.',
        category: 'Automotive',
        price: 800,
        images: [sampleImages[3], sampleImages[4]],
        sellerId: sellers[0]._id,
        isActive: true
      }
    ]);

    // Create Sample Orders
    console.log('Creating sample orders...');
    const orders = [];
    
    // Order 1
    const order1 = new Order({
      buyerId: buyers[0]._id,
      sellerId: sellers[0]._id,
      products: [
        {
          productId: products[0]._id, // iPhone 15 Pro
          quantity: 1,
          price: 120000
        }
      ],
      totalAmount: 120000,
      status: 'Processing',
      paymentMethod: 'Cash on Delivery',
      shippingAddress: '123 Main Street, Dhaka, Bangladesh'
    });
    await order1.save();
    orders.push(order1);
    
    // Order 2
    const order2 = new Order({
      buyerId: buyers[1]._id,
      sellerId: sellers[1]._id,
      products: [
        {
          productId: products[4]._id, // Premium Cotton T-Shirt
          quantity: 3,
          price: 1200
        },
        {
          productId: products[5]._id, // Denim Jeans
          quantity: 1,
          price: 2500
        }
      ],
      totalAmount: 6100, // (1200 * 3) + 2500
      status: 'Completed',
      paymentMethod: 'Cash on Delivery',
      shippingAddress: '456 Fashion Avenue, Chittagong, Bangladesh'
    });
    await order2.save();
    orders.push(order2);
    
    // Order 3
    const order3 = new Order({
      buyerId: buyers[2]._id,
      sellerId: sellers[2]._id,
      products: [
        {
          productId: products[8]._id, // Learn JavaScript
          quantity: 1,
          price: 800
        },
        {
          productId: products[9]._id, // React Development Handbook
          quantity: 1,
          price: 1200
        }
      ],
      totalAmount: 2000,
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
      shippingAddress: '789 Book Street, Sylhet, Bangladesh'
    });
    await order3.save();
    orders.push(order3);
    
    // Order 4
    const order4 = new Order({
      buyerId: buyers[0]._id,
      sellerId: sellers[3]._id,
      products: [
        {
          productId: products[11]._id, // Indoor Plant Set
          quantity: 1,
          price: 2200
        },
        {
          productId: products[12]._id, // LED Table Lamp
          quantity: 2,
          price: 1800
        }
      ],
      totalAmount: 5800, // 2200 + (1800 * 2)
      status: 'Out for Delivery',
      paymentMethod: 'Cash on Delivery',
      shippingAddress: '123 Main Street, Dhaka, Bangladesh'
    });
    await order4.save();
    orders.push(order4);

    console.log('Seed data created successfully!');
    console.log(`Created:
    - 1 Admin user
    - ${sellers.length} Seller users
    - ${buyers.length} Buyer users
    - ${products.length} Products
    - ${orders.length} Orders`);

    console.log('\nLogin credentials:');
    console.log('Admin: admin@ecommerce.com / admin123');
    console.log('Sellers: techstore@example.com, fashion@example.com, books@example.com, homeandgarden@example.com / seller123');
    console.log('Buyers: ahmed@example.com, fatima@example.com, karim@example.com / buyer123');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seed script
if (require.main === module) {
  seedData();
}

export default seedData;