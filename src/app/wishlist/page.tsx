'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api, Product } from '@/lib/api';

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getWishlist = useCallback((): number[] => {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; }
  }, []);

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    const ids = getWishlist();
    if (ids.length === 0) { setWishlistProducts([]); setIsLoading(false); return; }

    const products: Product[] = [];
    for (const id of ids) {
      try {
        const product = await api.getProduct(id);
        products.push(product);
      } catch { /* skip missing products */ }
    }
    setWishlistProducts(products);
    setIsLoading(false);
  }, [getWishlist]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const removeFromWishlist = (productId: number) => {
    const current = getWishlist();
    const updated = current.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setWishlistProducts(prev => prev.filter(p => p.id !== productId));
    window.dispatchEvent(new Event('storage'));
  };

  const addToCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    try {
      await api.addToCart(productId, 1);
      alert('Added to cart!');
    } catch { alert('Failed to add to cart'); }
  };

  if (isLoading) return <div className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 text-center"><p>Loading wishlist...</p></div></div>;

  if (wishlistProducts.length === 0) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-8">Save items you love to your wishlist.</p>
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist ({wishlistProducts.length})</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {wishlistProducts.map((product) => {
            const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
            return (
              <div key={product.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                  <Link href={`/products/${product.id}`}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 w-12 h-12 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">-{discount}%</span>
                  )}
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-base font-medium text-dark hover:text-primary transition-colors mb-1">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-dark">${product.price.toFixed(2)}</span>
                    {product.original_price && <span className="text-sm text-gray-400 line-through">${product.original_price.toFixed(2)}</span>}
                  </div>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
