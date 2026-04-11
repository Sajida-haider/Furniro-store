import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-20">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <span className="inline-block text-sm font-medium text-text tracking-wide">
              New Arrival
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-dark" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Discover Our
              <br />
              New Collection
            </h1>

            <p className="text-base text-text max-w-md leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis.
            </p>

            <Link
              href="/products"
              className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white text-sm font-semibold rounded-none hover:bg-primary-dark transition-colors duration-300"
            >
              SHOP NOW
            </Link>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&h=600&fit=crop"
                alt="Modern Furniture Collection"
                className="w-full h-[400px] sm:h-[480px] lg:h-[560px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
