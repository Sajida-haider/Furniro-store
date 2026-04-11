export default function Newsletter() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Stay Updated
          </h2>
          <p className="text-base text-text-light mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter to get updates on new products and special offers.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 border border-border bg-white text-dark placeholder:text-text-light focus:outline-none focus:border-primary transition-colors"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
