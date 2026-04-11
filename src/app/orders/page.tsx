'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Order } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const router = useRouter();

  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsAuthenticated(false); setIsLoading(false); return; }
    setIsAuthenticated(true);
    try {
      const data = await api.getOrders();
      const sorted = data.orders.sort((a: Order, b: Order) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setOrders(sorted);
    } catch { setOrders([]); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelError('');
    try {
      await api.request(`/orders/${orderId}/cancel`, { method: 'POST' });
      await loadOrders();
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Failed to cancel order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (status: string) => ['pending', 'processing'].includes(status);

  if (isLoading) return <div className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 text-center"><p>Loading orders...</p></div></div>;

  if (!isAuthenticated) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h1>
          <Link href="/login" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-8">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

        {cancelError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{cancelError}</p>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order #{order.id}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(order.status)}`}>
                    {order.status === 'cancelled' ? '❌ Cancelled' : order.status}
                  </span>
                  <span className="text-lg font-bold text-gray-900">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => item.product && (
                    <div key={item.id} className="flex items-center gap-4">
                      <Link href={`/products/${item.product_id}`} className="flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg hover:opacity-75 transition-opacity" />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/products/${item.product_id}`} className="text-sm font-medium text-gray-900 hover:text-primary">{item.product.name}</Link>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600"><span className="font-medium">Shipping:</span> {order.shipping_address}</p>
                  <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Payment:</span> {order.payment_method === 'card' ? 'Credit/Debit Card' : order.payment_method}</p>
                </div>

                {/* Cancel Order Button - only for pending/processing orders */}
                {canCancel(order.status) && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">💡 You can cancel this order before it ships.</p>
                    <button onClick={() => handleCancelOrder(order.id)} className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                      Cancel This Order
                    </button>
                  </div>
                )}

                {/* Already Cancelled Message */}
                {order.status === 'cancelled' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-red-600">⚠️ This order has been cancelled.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
