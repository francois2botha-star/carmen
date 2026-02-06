// Database Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  weight_kg: number;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  user_email: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_cost: number;
  total: number;
  pudo_size: 'small' | 'medium' | 'large';
  shipping_address: ShippingAddress;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  email: string;
  pudo_location: string;
  city: string;
  province: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total_weight: number;
}

// Shipping Types
export type PudoSize = 'small' | 'medium' | 'large';

export interface ShippingOption {
  size: PudoSize;
  max_weight: number;
  price: number;
}

export interface ShippingCalculation {
  size: PudoSize;
  price: number;
  total_weight: number;
}

// Payment Types
export interface PaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first: string;
  email_address: string;
  amount: string;
  item_name: string;
  custom_str1: string; // order_id
}
