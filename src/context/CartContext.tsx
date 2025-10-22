'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Variant } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  cartItems: CartItem[];
  // --- ✨ 1. تم تحديث الدالة لتقبل الكمية ---
  addToCart: (product: Product, variant: Variant, quantity: number) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- ✨ 2. تم إعادة كتابة منطق الدالة بالكامل ---
  const addToCart = (product: Product, variant: Variant, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === variant.id);

      // التحقق من المخزون المتاح
      const availableStock = variant.stock_quantity ?? Infinity;
      if (!existingItem && quantity > availableStock) {
          toast.error(`الكمية المطلوبة غير متوفرة. المتاح: ${availableStock} قطعة`);
          return prevItems;
      }

      if (existingItem) {
        // إذا كان العنصر موجودًا، قم بزيادة الكمية
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > availableStock) {
            toast.warning(`تم الوصول للحد الأقصى للمخزون. المتاح: ${availableStock} قطعة`);
            return prevItems.map(item =>
                item.id === variant.id ? { ...item, quantity: availableStock } : item
            );
        }
        return prevItems.map(item =>
          item.id === variant.id ? { ...item, quantity: newQuantity } : item
        );

      } else {
        // إذا كان العنصر جديدًا، قم بإضافته
        const newItem: CartItem = {
            id: variant.id,
            productId: product.id,
            name: `${product.name} (${variant.color || ''})`,
            price: Number(variant.price),
            quantity: quantity,
            image: variant.images?.[0],
            merchantName: product.merchantName,
            
            product: product, 
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (variantId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== variantId));
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => {
            if (item.id === variantId) {
                const availableStock = item.quantity ?? Infinity;
                const newQuantity = Math.min(quantity, availableStock);
                if (quantity > availableStock) {
                    toast.warning(`الكمية المتاحة هي ${availableStock} فقط.`);
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        })
      );
    }
  };

  const clearCart = () => {
      setCartItems([]);
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};