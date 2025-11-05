'use client';

import { useState } from 'react';
import { useCart } from '@/lib/useCart';
import { Product } from '@/lib/product-api';
import { toast } from 'react-hot-toast';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
}

export default function AddToCartButton({ 
  product, 
  quantity = 1, 
  className = '',
  children 
}: AddToCartButtonProps) {
  const { addToCart, isInCart, getProductQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const productInCart = isInCart(product._id);
  const currentQuantity = getProductQuantity(product._id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      addToCart(product, quantity);
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const defaultClassName = `
    w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium 
    hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed 
    transition-colors flex items-center justify-center space-x-2
  `;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || !product.isActive}
      className={className || defaultClassName}
    >
      {isAdding ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Adding...</span>
        </>
      ) : (
        <>
          {children || (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              <span>
                {productInCart 
                  ? `Add More (${currentQuantity} in cart)` 
                  : 'Add to Cart'
                }
              </span>
            </>
          )}
        </>
      )}
    </button>
  );
}