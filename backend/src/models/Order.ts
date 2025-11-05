import mongoose, { Document, Schema } from 'mongoose';

// Order product interface
export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

// Order status history interface
export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  updatedBy: mongoose.Types.ObjectId;
}

// Order interface
export interface IOrder extends Document {
  _id: string;
  orderId: string;         // Unique order identifier
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Out for Delivery' | 'Completed' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  orderDate: Date;
  statusHistory: IOrderStatusHistory[];
}

// Order product schema
const orderProductSchema = new Schema<IOrderProduct>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot exceed 100']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
}, { _id: false });

// Order status history schema
const statusHistorySchema = new Schema<IOrderStatusHistory>({
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'],
      message: 'Invalid status value'
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Updated by user ID is required']
  }
}, { _id: false });

// Order schema
const orderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    unique: true,
    trim: true
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  products: {
    type: [orderProductSchema],
    required: [true, 'Products are required'],
    validate: {
      validator: function(products: IOrderProduct[]) {
        return products.length > 0;
      },
      message: 'Order must contain at least one product'
    }
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'],
      message: 'Invalid order status'
    },
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    default: 'Cash on Delivery',
    enum: {
      values: ['Cash on Delivery', 'Online Payment'],
      message: 'Invalid payment method'
    }
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true,
    maxlength: [500, 'Shipping address cannot exceed 500 characters']
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: []
  }
});

// Pre-save middleware to generate unique order ID
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderId) {
    // Generate unique order ID with timestamp and random string
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderId = `ORD-${timestamp}-${randomStr}`;
  }
  
  // Add initial status to history if it's a new order
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.buyerId
    });
  }
  
  next();
});

// Pre-save middleware to update status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    // Add new status to history
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.sellerId // Assuming seller updates the status
    });
  }
  
  next();
});

// Index for better query performance
orderSchema.index({ buyerId: 1 });
orderSchema.index({ sellerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });

// Virtual for populated buyer information
orderSchema.virtual('buyer', {
  ref: 'User',
  localField: 'buyerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for populated seller information
orderSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Create and export the Order model
const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;