'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Category } from '@/lib/api';

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>Browse The Range</h2>
          <p className="text-base text-text-light">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.name.toLowerCase()}`} className="group text-center">
              <div className="relative overflow-hidden mb-4 aspect-[4/5]">
                <img src={category.image || 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop'} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-lg font-semibold text-dark group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-playfair), serif" }}>{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
