'use client';

import { useState, useEffect } from 'react';
import { Cart, CartManager } from './cart';
import { Product } from './product-api';

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalAmount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      const savedCart = CartManager.getCart();
      setCart(savedCart);
      setIsLoading(false);
    };

    loadCart();
  }, []);

  // Add product to cart
  const addToCart = (product: Product, quantity: number = 1) => {
    const updatedCart = CartManager.addToCart(product, quantity);
    setCart(updatedCart);
    return updatedCart;
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    const updatedCart = CartManager.removeFromCart(productId);
    setCart(updatedCart);
    return updatedCart;
  };

  // Update product quantity
  const updateQuantity = (productId: string, quantity: number) => {
    const updatedCart = CartManager.updateQuantity(productId, quantity);
    setCart(updatedCart);
    return updatedCart;
  };

  // Clear entire cart
  const clearCart = () => {
    const emptyCart = CartManager.clearCart();
    setCart(emptyCart);
    return emptyCart;
  };

  // Get product quantity in cart
  const getProductQuantity = (productId: string): number => {
    return CartManager.getProductQuantity(productId);
  };

  // Check if product is in cart
  const isInCart = (productId: string): boolean => {
    return CartManager.isInCart(productId);
  };

  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getProductQuantity,
    isInCart,
  };
}