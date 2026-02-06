import { supabase } from '@/lib/supabase';
import { Order, OrderItem, ShippingAddress } from '@/types';

/**
 * Create a new order
 */
export async function createOrder(
  userEmail: string,
  subtotal: number,
  shippingCost: number,
  pudoSize: 'small' | 'medium' | 'large',
  shippingAddress: ShippingAddress,
  items: Array<{ product_id: string; quantity: number; price: number }>
) {
  const total = subtotal + shippingCost;

  // Start a transaction - create order first
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_email: userEmail,
        status: 'pending',
        subtotal,
        shipping_cost: shippingCost,
        total,
        pudo_size: pudoSize,
        shipping_address: shippingAddress,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // Create order items
  const orderItems = items.map(item => ({
    order_id: orderData.id,
    ...item,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
}

/**
 * Fetch order by ID
 */
export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

/**
 * Fetch order items
 */
export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const { data, error } = await supabase
    .from('order_items')
    .select(
      `
      *,
      product:products(*)
    `
    )
    .eq('order_id', orderId);

  if (error) {
    console.error('Error fetching order items:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch all orders (admin only)
 */
export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark order as paid after successful payment
 */
export async function confirmOrderPayment(orderId: string) {
  return updateOrderStatus(orderId, 'paid');
}
