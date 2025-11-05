import { Product } from './product-api';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

// Cart utility functions with local storage
export class CartManager {
  private static STORAGE_KEY = 'ecommerce_cart';

  // Get cart from localStorage
  static getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], totalItems: 0, totalAmount: 0 };
    }

    try {
      const cartData = localStorage.getItem(this.STORAGE_KEY);
      if (cartData) {
        const cart = JSON.parse(cartData) as Cart;
        return this.calculateTotals(cart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }

    return { items: [], totalItems: 0, totalAmount: 0 };
  }

  // Save cart to localStorage
  static saveCart(cart: Cart): void {
    if (typeof window === 'undefined') return;

    try {
      const updatedCart = this.calculateTotals(cart);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  // Calculate cart totals
  static calculateTotals(cart: Cart): Cart {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    return {
      ...cart,
      totalItems,
      totalAmount
    };
  }

  // Add product to cart
  static addToCart(product: Product, quantity: number = 1): Cart {
    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(item => item.product._id === product._id);

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({ product, quantity });
    }

    const updatedCart = this.calculateTotals(cart);
    this.saveCart(updatedCart);
    return updatedCart;
  }

  // Remove product from cart
  static removeFromCart(productId: string): Cart {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.product._id !== productId);
    
    const updatedCart = this.calculateTotals(cart);
    this.saveCart(updatedCart);
    return updatedCart;
  }

  // Update product quantity in cart
  static updateQuantity(productId: string, quantity: number): Cart {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(item => item.product._id === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
    }

    const updatedCart = this.calculateTotals(cart);
    this.saveCart(updatedCart);
    return updatedCart;
  }

  // Clear entire cart
  static clearCart(): Cart {
    const emptyCart: Cart = { items: [], totalItems: 0, totalAmount: 0 };
    this.saveCart(emptyCart);
    return emptyCart;
  }

  // Get cart item by product ID
  static getCartItem(productId: string): CartItem | undefined {
    const cart = this.getCart();
    return cart.items.find(item => item.product._id === productId);
  }

  // Check if product is in cart
  static isInCart(productId: string): boolean {
    return this.getCartItem(productId) !== undefined;
  }

  // Get cart item count for a specific product
  static getProductQuantity(productId: string): number {
    const item = this.getCartItem(productId);
    return item ? item.quantity : 0;
  }
}