'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';

function getWishlist(): number[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
}

export default function NavbarIcons() {
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); setUser(null); return; }
    try {
      const [userData, cartData] = await Promise.all([
        api.getMe(),
        api.getCart().catch(() => null),
      ]);
      setUser(userData);
      if (cartData) setCartCount(cartData.item_count);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadUserData();
    setWishlistCount(getWishlist().length);

    // Poll cart & wishlist counts
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const cartData = await api.getCart();
          setCartCount(cartData.item_count);
        } catch { /* ignore */ }
      }
      setWishlistCount(getWishlist().length);
    }, 2000);

    // Instant update events
    const onCartChanged = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try { setCartCount((await api.getCart()).item_count); } catch { /* ignore */ }
      }
    };
    const onWishlistChanged = () => setWishlistCount(getWishlist().length);

    window.addEventListener('cart-changed', onCartChanged);
    window.addEventListener('wishlist-changed', onWishlistChanged);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cart-changed', onCartChanged);
      window.removeEventListener('wishlist-changed', onWishlistChanged);
    };
  }, [loadUserData]);

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    setWishlistCount(0);
    router.push('/');
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <div className="flex items-center gap-1">
      {isAuthenticated ? (
        <div className="relative group">
          <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Account">
            <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
            </svg>
          </button>
          <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
            {isAdmin && <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</Link>}
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
          </div>
        </div>
      ) : (
        <Link href="/login" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Login">
          <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        </Link>
      )}

      <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Search">
        <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {/* Wishlist */}
      <Link href="/wishlist" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative" aria-label="Wishlist">
        <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        {wishlistCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistCount}</span>
        )}
      </Link>

      {/* Cart */}
      <Link href="/cart" className="p-2.5 hover:bg-gray-100 rounded-full transition-colors relative" aria-label="Cart">
        <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        {!loading && cartCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>
        )}
      </Link>
    </div>
  );
}
