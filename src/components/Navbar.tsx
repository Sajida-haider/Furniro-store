'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from '@/lib/api';

function getWishlist(): number[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const userData = await api.getMe();
      setUser(userData);

      // Load cart
      const cartData = await api.getCart().catch(() => null);
      if (cartData) setCartCount(cartData.item_count);

      // If admin, load pending orders count immediately
      if (userData.role === 'admin') {
        try {
          const stats = await api.getAdminStats();
          const pendingCount = stats.recent_orders.filter(
            o => o.status === 'pending' || o.status === 'processing'
          ).length;
          setPendingOrdersCount(pendingCount);
        } catch { /* ignore */ }
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadUserData();
    setWishlistCount(getWishlist().length);

    // Poll cart & wishlist counts every 2 seconds
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

    // Poll pending orders count for admin every 30 seconds
    const adminInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          if (userData.role === 'admin') {
            const stats = await api.getAdminStats();
            // Count pending/processing orders
            const pendingCount = stats.recent_orders.filter(
              o => o.status === 'pending' || o.status === 'processing'
            ).length;
            setPendingOrdersCount(pendingCount);
          }
        } catch { /* ignore */ }
      }
    }, 30000);

    // Instant update when cart-changed event fires
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
      clearInterval(adminInterval);
      window.removeEventListener('cart-changed', onCartChanged);
      window.removeEventListener('wishlist-changed', onWishlistChanged);
    };
  }, [loadUserData]);

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    setIsMenuOpen(false);
    router.push('/');
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 24V14C6 11.79 7.79 10 10 10H18C20.21 10 22 11.79 22 14V24" stroke="#B88E2F" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M4 24H24" stroke="#B88E2F" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M10 10V6C10 4.89543 10.8954 4 12 4H16C17.1046 4 18 4.89543 18 6V10" stroke="#B88E2F" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-xl font-semibold text-dark" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>Furniro</span>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            <Link href="/" className="text-sm font-medium text-dark transition-colors">Home</Link>
            <Link href="/products" className="text-sm text-text hover:text-dark transition-colors">Shop</Link>
            <Link href="/about" className="text-sm text-text hover:text-dark transition-colors">About</Link>
            <Link href="/contact" className="text-sm text-text hover:text-dark transition-colors">Contact</Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm text-primary hover:text-dark transition-colors relative">
                Admin
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            )}
          </div>

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

            <button className="lg:hidden p-2.5 hover:bg-gray-100 rounded-full transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-1">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-dark hover:bg-gray-50 rounded-lg">Home</Link>
              <Link href="/products" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm text-text hover:bg-gray-50 rounded-lg">Shop</Link>
              <Link href="/about" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm text-text hover:bg-gray-50 rounded-lg">About</Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm text-text hover:bg-gray-50 rounded-lg">Contact</Link>
              <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm text-text hover:bg-gray-50 rounded-lg">Wishlist ({wishlistCount})</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/orders" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm text-text hover:bg-gray-50 rounded-lg">My Orders</Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm text-primary hover:bg-gray-50 rounded-lg relative">
                      Admin Panel
                      {pendingOrdersCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrdersCount}</span>
                      )}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="px-4 py-3 text-sm text-left text-red-600 hover:bg-gray-50 rounded-lg">Logout</button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50 rounded-lg">Login / Signup</Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
