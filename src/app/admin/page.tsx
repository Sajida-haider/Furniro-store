'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, AdminStats, OrderWithUser, Product, User, Category } from '@/lib/api';

type TabType = 'dashboard' | 'products' | 'orders' | 'users' | 'add-product';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Add product form
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', original_price: '',
    image: '', category: '', badge: '', stock: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Check admin auth
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); router.push('/login'); return; }
      try {
        const user = await api.getMe();
        if (user.role !== 'admin') { router.push('/'); return; }
        setIsAdmin(true);
        setIsAuthenticated(true);
        fetchData();
      } catch {
        localStorage.removeItem('token');
        router.push('/login');
      } finally { setIsLoading(false); }
    };
    checkAdmin();
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, ordersData, productsData, usersData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminOrders(),
        api.getAdminProducts(),
        api.getAdminUsers(),
      ]);
      setStats(statsData);
      setOrders(ordersData);
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) { console.error('Failed to fetch admin data:', error); } finally { setIsLoading(false); }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchData();
    } catch (error) { console.error('Failed to update order:', error); }
  };

  const handleToggleUserActive = async (userId: number) => {
    try {
      await api.toggleUserActive(userId);
      fetchData();
    } catch (error) { console.error('Failed to update user:', error); }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    try {
      // Use direct API call since there's no dedicated delete endpoint yet
      await api.request(`/admin/orders/${orderId}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      // If DELETE endpoint doesn't exist, mark as cancelled instead
      try {
        await api.updateOrderStatus(orderId, 'cancelled');
        fetchData();
      } catch (e) {
        console.error('Failed to delete/cancel order:', e);
      }
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(productId);
      fetchData();
    } catch (error) { console.error('Failed to delete product:', error); }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmitting(true);
    try {
      await api.createProduct({
        name: newProduct.name,
        description: newProduct.description || null,
        price: parseFloat(newProduct.price),
        original_price: newProduct.original_price ? parseFloat(newProduct.original_price) : null,
        image: newProduct.image || 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&h=500&fit=crop',
        category: newProduct.category || null,
        badge: newProduct.badge || null,
        stock: parseInt(newProduct.stock) || 0,
        is_active: true,
      });
      setFormSuccess('Product added successfully!');
      setNewProduct({ name: '', description: '', price: '', original_price: '', image: '', category: '', badge: '', stock: '' });
      fetchData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add product');
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="py-16 lg:py-24"><div className="max-w-7xl mx-auto px-4 text-center"><p>Loading admin panel...</p></div></div>;
  if (!isAuthenticated) return null;

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

  return (
    <div className="py-16 lg:py-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Panel</h1>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mt-1 inline-block">← Back to Store</Link>
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">Refresh Data</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {([
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'add-product', label: '+ Add Product' },
            { id: 'products', label: 'Products' },
            { id: 'orders', label: 'Orders' },
            { id: 'users', label: 'Users' },
          ]).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>{tab.label}</button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_products}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_orders}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.total_revenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  </tr></thead>
                  <tbody>{stats.recent_orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">#{order.id}</td>
                      <td className="py-3 px-4 text-sm font-semibold">${order.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add-product' && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h2>
            {formError && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}
            {formSuccess && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{formSuccess}</div>}
            <form onSubmit={handleAddProduct} className="space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Original Price <span className="text-gray-400">(optional)</span></label>
                  <input type="number" step="0.01" value={newProduct.original_price} onChange={e => setNewProduct({...newProduct, original_price: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" placeholder="https://images.unsplash.com/..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" placeholder="e.g. Dining, Living" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Badge <span className="text-gray-400">(Sale/New)</span></label>
                  <input type="text" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" placeholder="Sale or New" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900" required /></div>
              {newProduct.image && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={newProduct.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                </div>
              )}
              <button type="submit" disabled={isSubmitting} className="w-full px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr></thead>
                <tbody>{products.map(product => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">#{product.id}</td>
                    <td className="py-3 px-4"><div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      <span className="text-sm font-medium">{product.name}</span></div></td>
                    <td className="py-3 px-4 text-sm font-semibold">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">{product.stock}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3 px-4"><button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr></thead>
                <tbody>{orders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">#{order.id}</td>
                    <td className="py-3 px-4 text-sm"><div><p className="font-medium">{order.user_name}</p><p className="text-xs text-gray-500">{order.user_email}</p></div></td>
                    <td className="py-3 px-4 text-sm font-semibold">${order.total_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">{order.payment_method}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>{order.status}</span></td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-2">
                        <select value={order.status} onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-gray-900">
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">🗑️ Delete Order</button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Username</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr></thead>
                <tbody>{users.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">#{user.id}</td>
                    <td className="py-3 px-4 text-sm font-medium">{user.username}</td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span></td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="py-3 px-4"><button onClick={() => handleToggleUserActive(user.id)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">{user.is_active ? 'Deactivate' : 'Activate'}</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
