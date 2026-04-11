export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description?: string;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}
