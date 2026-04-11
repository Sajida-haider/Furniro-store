import Link from 'next/link';

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  variant?: 'primary' | 'secondary';
}

export default function PromoBanner({
  title = 'Summer Sale - Up to 50% Off',
  subtitle = 'Transform your home with premium furniture at unbeatable prices. Limited time offer!',
  ctaText = 'Shop the Sale',
  ctaLink = '/products',
  variant = 'primary',
}: PromoBannerProps) {
  const bgClass = variant === 'primary'
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    : 'bg-gradient-to-br from-amber-600 via-amber-500 to-amber-600';

  return (
    <section className={`${bgClass} text-white py-16 lg:py-24 overflow-hidden relative`}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              Limited Offer
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-lg text-white/80 max-w-lg leading-relaxed">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {ctaText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop"
                alt="Promotional Banner"
                className="w-full h-[300px] sm:h-[350px] lg:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            {/* Discount Badge */}
            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-white text-gray-900 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/20">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold leading-tight">50%</p>
                <p className="text-[10px] sm:text-xs font-medium">OFF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
