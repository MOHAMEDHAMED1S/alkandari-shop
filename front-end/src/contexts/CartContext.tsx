import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/api';

export interface CartProduct extends Product {
  quantity: number;
  selectedSize?: string;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartProduct[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, size?: string, quantity = 1) => {
    // التحقق من التوفر
    if (!product.is_in_stock) {
      console.warn('Cannot add out of stock product to cart');
      return;
    }

    setCart(prevCart => {
      // البحث عن المنتج مع نفس المقاس
      // المنتجات بمقاسات مختلفة تُعامل كمنتجات منفصلة
      const existingItem = prevCart.find(item => 
        item.id === product.id && item.selectedSize === size
      );
      
      if (existingItem) {
        // التحقق من الكمية المتاحة إذا كان له مخزون
        if (product.has_inventory && product.stock_quantity !== null) {
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.stock_quantity) {
            console.warn(`Cannot add more than ${product.stock_quantity} items`);
            // إضافة الكمية المتبقية فقط
            return prevCart.map(item =>
              item.id === product.id && item.selectedSize === size
                ? { ...item, quantity: product.stock_quantity }
                : item
            );
          }
        }
        
        return prevCart.map(item =>
          item.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // التحقق من الكمية عند إضافة منتج جديد
      if (product.has_inventory && product.stock_quantity !== null) {
        if (quantity > product.stock_quantity) {
          console.warn(`Cannot add more than ${product.stock_quantity} items`);
          return [...prevCart, { ...product, quantity: product.stock_quantity, selectedSize: size }];
        }
      }
      
      return [...prevCart, { ...product, quantity, selectedSize: size }];
    });
  };

  const removeFromCart = (productId: number, size?: string) => {
    setCart(prevCart => prevCart.filter(item => 
      !(item.id === productId && item.selectedSize === size)
    ));
  };

  const updateQuantity = (productId: number, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId && item.selectedSize === size) {
          // التحقق من الكمية المتاحة
          if (item.has_inventory && item.stock_quantity !== null) {
            // التأكد من عدم تجاوز الكمية المتاحة
            const finalQuantity = Math.min(quantity, item.stock_quantity);
            if (finalQuantity !== quantity) {
              console.warn(`Limited to available stock: ${item.stock_quantity}`);
            }
            return { ...item, quantity: finalQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.has_discount && item.discounted_price
        ? parseFloat(item.discounted_price.toString())
        : parseFloat(item.price.toString());
      return total + itemPrice * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
