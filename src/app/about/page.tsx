'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            About FurniStore
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to make premium furniture accessible to everyone, everywhere.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div className="order-2 lg:order-1">
            <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Our Story
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded in 2020, FurniStore began with a simple idea: everyone deserves access to beautifully designed, high-quality furniture. What started as a small online shop has grown into a trusted destination for thousands of customers worldwide.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We work directly with skilled craftspeople and sustainable manufacturers to bring you furniture that's not only stunning but built to last. Every piece in our collection is carefully selected for its design, quality, and value.
            </p>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop"
              alt="Our Story"
              className="rounded-2xl shadow-lg w-full h-[350px] lg:h-[400px] object-cover"
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 mb-16 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-gray-200">
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">500+</p>
              <p className="text-gray-600 text-sm">Products</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">10k+</p>
              <p className="text-gray-600 text-sm">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">50+</p>
              <p className="text-gray-600 text-sm">Cities Served</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">4.9</p>
              <p className="text-gray-600 text-sm">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Values
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-900 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Quality First</h3>
              <p className="text-gray-600 leading-relaxed">
                We never compromise on quality. Every product is tested and verified before it makes it to our collection.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-900 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Pricing</h3>
              <p className="text-gray-600 leading-relaxed">
                By working directly with manufacturers, we cut out the middleman and pass the savings to you.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-900 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainability</h3>
              <p className="text-gray-600 leading-relaxed">
                We're committed to sustainable practices, using eco-friendly materials and responsible sourcing.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Team
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop"
                alt="Team Member"
                className="w-32 h-32 mx-auto rounded-full object-cover mb-6 ring-4 ring-gray-100"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-1">James Wilson</h3>
              <p className="text-gray-500">Founder & CEO</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"
                alt="Team Member"
                className="w-32 h-32 mx-auto rounded-full object-cover mb-6 ring-4 ring-gray-100"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Emily Chen</h3>
              <p className="text-gray-500">Head of Design</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop"
                alt="Team Member"
                className="w-32 h-32 mx-auto rounded-full object-cover mb-6 ring-4 ring-gray-100"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Marcus Johnson</h3>
              <p className="text-gray-500">Operations Manager</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-900 text-white rounded-3xl p-10 sm:p-12">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive offers, design tips, and new product launches.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Get in Touch
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
