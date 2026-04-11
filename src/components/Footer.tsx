import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 24V14C6 11.79 7.79 10 10 10H18C20.21 10 22 11.79 22 14V24" stroke="#B88E2F" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M4 24H24" stroke="#B88E2F" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M10 10V6C10 4.89543 10.8954 4 12 4H16C17.1046 4 18 4.89543 18 6V10" stroke="#B88E2F" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                Furniro
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              400 University Drive Suite 200 Coral Gables, FL 33134 USA
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">
              Links
            </h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">Shop</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">
              Help
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Payment Options</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Returns</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policies</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-6">
              Newsletter
            </h4>
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter Your Email Address"
                className="flex-1 px-4 py-3 border-b border-gray-600 bg-transparent text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            2024 Furniro. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/120px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-5 opacity-50" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/120px-PayPal.svg.png" alt="PayPal" className="h-5 opacity-50" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 opacity-50" />
          </div>
        </div>
      </div>
    </footer>
  );
}
