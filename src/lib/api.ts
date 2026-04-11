const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...restOptions } = options;

    const authToken = token !== undefined ? token : this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(customHeaders as Record<string, string>),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...restOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData?.detail || errorData?.message || `API Error: ${response.status}`
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============ AUTH ============

  async signup(data: { email: string; username: string; password: string; full_name?: string }) {
    return this.request<{ access_token: string; token_type: string; user: User }>(
      '/auth/signup',
      { method: 'POST', body: JSON.stringify(data) }
    );
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; token_type: string; user: User }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    );
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  // ============ PRODUCTS ============

  async getProducts(params?: {
    page?: number;
    page_size?: number;
    category?: string;
    search?: string;
    sort?: string;
  }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString();
    return this.request<ProductListResponse>(`/products/${qs ? `?${qs}` : ''}`);
  }

  async getProduct(id: number) {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>) {
    return this.request<Product>('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<Product>) {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number) {
    return this.request<void>(`/products/${id}`, { method: 'DELETE' });
  }

  // ============ CATEGORIES ============

  async getCategories() {
    return this.request<Category[]>('/categories/');
  }

  async createCategory(data: { name: string; image?: string; count?: number }) {
    return this.request<Category>('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<Category>) {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request<void>(`/categories/${id}`, { method: 'DELETE' });
  }

  // ============ CART ============

  async getCart() {
    return this.request<CartResponse>('/cart/');
  }

  async addToCart(productId: number, quantity: number) {
    return this.request<CartItemResponse>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request<CartItemResponse>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number) {
    return this.request<void>(`/cart/items/${itemId}`, { method: 'DELETE' });
  }

  async clearCart() {
    return this.request<void>('/cart/clear', { method: 'DELETE' });
  }

  // ============ ORDERS ============

  async createOrder(data: {
    shipping_address: string;
    payment_method: string;
    notes?: string;
  }) {
    return this.request<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(page?: number, page_size?: number) {
    const query = new URLSearchParams();
    if (page) query.set('page', String(page));
    if (page_size) query.set('page_size', String(page_size));
    const qs = query.toString();
    return this.request<{ orders: Order[]; total: number }>(`/orders/${qs ? `?${qs}` : ''}`);
  }

  async getOrder(id: number) {
    return this.request<Order>(`/orders/${id}`);
  }

  // ============ ADMIN ============

  async getAdminStats() {
    return this.request<AdminStats>('/admin/stats');
  }

  async getAdminUsers() {
    return this.request<User[]>('/admin/users');
  }

  async updateUserRole(userId: number, role: 'user' | 'admin') {
    return this.request<User>(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async toggleUserActive(userId: number) {
    return this.request<User>(`/admin/users/${userId}/active`, {
      method: 'PUT',
    });
  }

  async getAdminOrders(statusFilter?: string) {
    const query = new URLSearchParams();
    if (statusFilter) query.set('status_filter', statusFilter);
    const qs = query.toString();
    return this.request<OrderWithUser[]>(`/admin/orders/${qs ? `?${qs}` : ''}`);
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getAdminProducts() {
    return this.request<Product[]>('/admin/products');
  }

  async getAdminCategories() {
    return this.request<Category[]>('/admin/categories');
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

// ============ TYPE DEFINITIONS ============

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string;
  rating: number;
  reviews: number;
  category: string | null;
  category_id: number | null;
  badge: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  image: string | null;
  count: number;
  created_at: string;
}

export interface CartItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  product: Product | null;
}

export interface CartResponse {
  items: CartItemResponse[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  item_count: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product | null;
}

export interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  items: OrderItem[];
}

export interface OrderWithUser extends Order {
  user_email: string;
  user_name: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  recent_orders: Order[];
}
