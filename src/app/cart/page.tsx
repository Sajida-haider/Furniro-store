'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, CartResponse, CartItemResponse, Product } from '@/lib/api';

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const loadCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsAuthenticated(false); setIsLoading(false); return; }
    setIsAuthenticated(true);
    try {
      const data = await api.getCart();
      setCart(data);
    } catch { setCart(null); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const updateQuantity = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    await api.updateCartItem(itemId, qty);
    await loadCart();
  };

  const removeItem = async (itemId: number) => {
    await api.removeFromCart(itemId);
    await loadCart();
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login to View Your Cart</h1>
          <Link href="/login" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 text-center"><p>Loading cart...</p></div></div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => item.product && (
              <div key={item.id} className="flex gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Link href={`/products/${item.product_id}`} className="flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-xl" />
                </Link>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <Link href={`/products/${item.product_id}`} className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors line-clamp-1">{item.product.name}</Link>
                    <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
                  </div>
                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600">-</button>
                      <span className="px-4 py-2 border-x border-gray-200 font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 hover:bg-gray-100 transition-colors text-gray-600">+</button>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-700 mt-1 font-medium">Remove</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600"><span>Subtotal ({cart.item_count} items)</span><span className="font-medium">${cart.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Shipping</span><span className={`font-medium ${cart.shipping === 0 ? 'text-green-600' : ''}`}>{cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}`}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax</span><span className="font-medium">${cart.tax.toFixed(2)}</span></div>
                <div className="border-t border-gray-200 pt-4"><div className="flex justify-between text-xl font-bold text-gray-900"><span>Total</span><span>${cart.total.toFixed(2)}</span></div></div>
              </div>
              {cart.shipping > 0 && (<p className="text-sm text-green-600 mb-6 p-3 bg-green-50 rounded-lg font-medium">Add `${(500 - cart.subtotal).toFixed(2)} more for FREE shipping!</p>)}
              <Link href="/checkout" className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors block text-center">Proceed to Checkout</Link>
              <Link href="/products" className="block text-center text-gray-600 hover:text-gray-900 mt-4 text-sm font-medium">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
