'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zipCode: '', country: 'Pakistan',
  });

  const loadCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsAuthenticated(false); return; }
    setIsAuthenticated(true);
    try { setCart(await api.getCart()); } catch { setCart(null); }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!cart || cart.items?.length === 0) { setError('Your cart is empty'); return; }

    setIsProcessing(true);

    try {
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
      const paymentLabel = paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa';

      await api.createOrder({
        shipping_address: shippingAddress,
        payment_method: paymentLabel,
      });

      await api.clearCart();
      router.push('/orders');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login to Checkout</h1>
          <Link href="/login" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-700">{error}</p></div>)}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: 'firstName', label: 'First Name', type: 'text' },
                    { name: 'lastName', label: 'Last Name', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'phone', label: 'Phone', type: 'tel' },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                      <input type={f.type} name={f.name} value={formData[f.name as keyof typeof formData]} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" required />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" required />
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900" required /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option>Pakistan</option><option>United States</option><option>Canada</option><option>United Kingdom</option>
                    </select></div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">💵 Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </label>

                  {/* JazzCash */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'jazzcash' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="jazzcash" checked={paymentMethod === 'jazzcash'} onChange={() => setPaymentMethod('jazzcash')} className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">📱 JazzCash</p>
                      <p className="text-sm text-gray-500">Pay via JazzCash mobile wallet</p>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/JazzCash_logo.svg/120px-JazzCash_logo.svg.png" alt="JazzCash" className="h-8" />
                  </label>

                  {/* EasyPaisa */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'easypaisa' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="easypaisa" checked={paymentMethod === 'easypaisa'} onChange={() => setPaymentMethod('easypaisa')} className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">📱 EasyPaisa</p>
                      <p className="text-sm text-gray-500">Pay via EasyPaisa mobile wallet</p>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/EasyPaisa_Logo.png/120px-EasyPaisa_Logo.png" alt="EasyPaisa" className="h-8" />
                  </label>
                </div>

                {/* JazzCash / EasyPaisa Instructions */}
                {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-800 mb-2">📲 {paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Payment Instructions:</p>
                    <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                      <li>Send <strong>${cart.total.toFixed(2)}</strong> to: <strong>0300-1234567</strong></li>
                      <li>Use Order # as reference</li>
                      <li>Order will be confirmed after payment verification</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {cart.items?.map((item: any) => item.product && (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1"><p className="text-sm font-medium text-gray-900">{item.product.name}</p><p className="text-sm text-gray-600">Qty: {item.quantity}</p></div>
                      <p className="text-sm font-semibold text-gray-900">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700"><span>Subtotal</span><span>${cart.subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-700"><span>Shipping</span><span className={cart.shipping === 0 ? 'text-green-600' : ''}>{cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}`}</span></div>
                  <div className="flex justify-between text-gray-700"><span>Tax</span><span>${cart.tax.toFixed(2)}</span></div>
                  <div className="border-t border-gray-200 pt-4"><div className="flex justify-between text-xl font-bold text-gray-900"><span>Total</span><span>${cart.total.toFixed(2)}</span></div></div>
                </div>
                <button type="submit" disabled={isProcessing} className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Processing...
                    </>
                  ) : (
                    <>Place Order — ${cart.total.toFixed(2)}</>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-4 text-center">🔒 Secure checkout</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
