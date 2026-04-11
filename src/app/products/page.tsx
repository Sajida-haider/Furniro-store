'use client';

import { useState, useEffect } from 'react';
import { api, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sortMap: Record<string, string> = { 'price-low': 'price_asc', 'price-high': 'price_desc', rating: 'rating', popular: 'newest' };
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ page, page_size: 12, category: selectedCategory !== 'All' ? selectedCategory : undefined, sort: sortMap[sortBy] }),
          api.getCategories(),
        ]);
        setProducts(productsRes.products);
        setTotalPages(productsRes.total_pages);
        setTotalCount(productsRes.total);
        setCategories(['All', ...categoriesRes.map((c: any) => c.name)]);
      } catch (error) { console.error('Failed to fetch products:', error); } finally { setIsLoading(false); }
    };
    fetchData();
  }, [selectedCategory, sortBy, page]);

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-4">Shop</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Shop All Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Browse our complete collection of premium furniture</p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 font-medium">Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900">
              <option value="default">Default</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="rating">Highest Rated</option><option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">Showing <span className="font-semibold text-gray-900">{products.length}</span> of <span className="font-semibold text-gray-900">{totalCount}</span> products{selectedCategory !== 'All' && ` in ${selectedCategory}`}</p>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse"><div className="bg-gray-200 rounded-2xl h-64 mb-4"></div><div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div><div className="h-4 bg-gray-200 rounded w-1/2"></div></div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            )}
          </>
        )}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
}
