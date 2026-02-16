import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, OrderStatus } from '@/types';

export const createOrder = async (
  orderData: Omit<Order, 'id' | 'created_at' | 'status'>,
  items: { product_id: string; product_name: string; quantity: number; price: number }[]
): Promise<Order> => {
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{ ...orderData, status: 'pending' }])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    ...item,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
};

export const fetchOrder = async (orderId: string): Promise<Order | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
};

export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) throw error;
};

export const confirmOrderPayment = async (orderId: string): Promise<void> => {
  await updateOrderStatus(orderId, 'paid');
};
