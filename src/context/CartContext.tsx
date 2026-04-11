'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, CartResponse } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CartContextType {
  cart: CartResponse | null;
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

const defaultCartContext: CartContextType = {
  cart: null,
  isLoading: false,
  addToCart: async () => {},
  updateCartItem: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const cartData = await api.getCart();
      setCart(cartData);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    if (!isAuthenticated) throw new Error('Please login to add items to cart');
    await api.addToCart(productId, quantity);
    await refreshCart();
  }, [isAuthenticated, refreshCart]);

  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    await api.updateCartItem(itemId, quantity);
    await refreshCart();
  }, [refreshCart]);

  const removeFromCart = useCallback(async (itemId: number) => {
    await api.removeFromCart(itemId);
    await refreshCart();
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    await api.clearCart();
    await refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{ cart, isLoading, addToCart, updateCartItem, removeFromCart, clearCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  return context || defaultCartContext;
}
