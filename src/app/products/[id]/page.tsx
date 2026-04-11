'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Product, Order } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const productId = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  useEffect(() => {
    if (!productId || isNaN(Number(productId))) return;
    const fetchProduct = async () => {
      try {
        const productData = await api.getProduct(Number(productId));
        setProduct(productData);
        const allProducts = await api.getProducts({ page_size: 20 });
        setRelatedProducts(allProducts.products.filter(p => p.id !== productData.id && p.category === productData.category).slice(0, 4));
      } catch { setProduct(null); } finally { setIsLoading(false); }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    setIsAdding(true);
    try { await api.addToCart(Number(productId), quantity); } catch (err) { console.error(err); } finally { setIsAdding(false); }
  };

  if (isLoading) return <div className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 text-center"><p>Loading...</p></div></div>;
  if (!product) return <div className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 text-center"><h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1></div></div>;

  const images = [product.image, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop'];
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-gray-900">Home</a><span>/</span><a href="/products" className="hover:text-gray-900">Products</a><span>/</span><span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && <span className={`absolute top-6 left-6 px-4 py-2 text-sm font-semibold rounded-full ${product.badge === 'Sale' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'}`}>{product.badge}</span>}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => <button key={i} onClick={() => setSelectedImage(i)} className={`overflow-hidden rounded-lg border-2 transition-colors ${selectedImage === i ? 'border-gray-900' : 'border-transparent hover:border-gray-300'}`}><img src={img} alt="" className="w-full aspect-square object-cover" /></button>)}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center">{[...Array(5)].map((_, i) => <svg key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}</div>
                <span className="text-gray-600">{product.rating} ({product.reviews} reviews)</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                {product.original_price && (<><span className="text-xl text-gray-500 line-through">${product.original_price.toFixed(2)}</span><span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">Save {discount}%</span></>)}
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{product.description || 'Experience luxury and comfort with our premium furniture piece. Crafted with high-quality materials and designed to complement modern interiors.'}</p>
            {product.stock !== undefined && <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</p>}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <label className="text-gray-700 font-medium">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100">-</button>
                  <span className="px-6 py-2 border-x border-gray-300 font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100">+</button>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={handleAddToCart} disabled={isAdding || product.stock === 0} className="flex-1 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">{isAdding ? 'Adding...' : 'Add to Cart'}</button>
              </div>
            </div>
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <div className="pt-16 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
