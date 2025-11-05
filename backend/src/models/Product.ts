import mongoose, { Document, Schema } from 'mongoose';

// Product interface
export interface IProduct extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];        // Array of Cloudinary public URLs
  documents: string[];     // Array of PDF Cloudinary URLs (optional)
  sellerId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

// Product schema
const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: {
      values: [
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
      ],
      message: 'Please select a valid category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price cannot exceed 1,000,000']
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 10; // Maximum 10 images per product
      },
      message: 'Cannot have more than 10 images per product'
    }
  },
  documents: {
    type: [String],
    default: [],
    validate: {
      validator: function(documents: string[]) {
        return documents.length <= 5; // Maximum 5 PDF documents per product
      },
      message: 'Cannot have more than 5 documents per product'
    }
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better search performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ isActive: 1 });

// Virtual for populated seller information
productSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;