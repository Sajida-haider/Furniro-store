'use client';

import Link from 'next/link';
import { Product, api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface ProductCardProps {
  product: Product & { id: string | number };
}

function getWishlist(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  } catch { return []; }
}

function setWishlist(ids: number[]) {
  localStorage.setItem('wishlist', JSON.stringify(ids));
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlistState] = useState<number[]>([]);

  useEffect(() => { setWishlistState(getWishlist()); }, []);

  const isLiked = wishlist.includes(Number(product.id));

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    setIsAdding(true);
    try {
      await api.addToCart(Number(product.id), 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      // Trigger navbar cart refresh
      window.dispatchEvent(new CustomEvent('cart-changed'));
    } catch { console.error('Failed to add to cart'); } finally { setIsAdding(false); }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pid = Number(product.id);
    let current = getWishlist();
    if (current.includes(pid)) {
      current = current.filter(id => id !== pid);
    } else {
      current.push(pid);
    }
    setWishlist(current);
    setWishlistState(current);
    // Trigger navbar wishlist refresh
    window.dispatchEvent(new CustomEvent('wishlist-changed'));
  };

  return (
    <div className="group relative">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-bg-light aspect-[3/4] mb-4">
        <Link href={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>

        {/* Sale Badge */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 w-12 h-12 bg-sale-red text-white text-xs font-semibold rounded-full flex items-center justify-center">
            -{discount}%
          </span>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`px-6 py-3 text-sm font-medium transition-colors disabled:opacity-75 ${
                added ? 'bg-green-500 text-white' : 'bg-white text-dark hover:bg-primary hover:text-white'
              }`}
            >
              {isAdding ? 'Adding...' : added ? '✓ Added!' : 'Add to Cart'}
            </button>
            <div className="flex gap-3">
              <button
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Compare"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isLiked ? 'bg-primary text-white' : 'bg-white hover:bg-primary hover:text-white'
                }`}
                aria-label="Like"
              >
                <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div>
        <Link href={`/products/${product.id}`}>
          <h3 className="text-base font-medium text-dark hover:text-primary transition-colors mb-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-text-light mb-2">{product.category}</p>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-dark">${product.price.toFixed(2)}</span>
          {product.original_price && (
            <span className="text-sm text-text-light line-through">${product.original_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
