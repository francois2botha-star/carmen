import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAllOrders, fetchOrderItems, updateOrderStatus } from '@/services/orderService';
import { Order, OrderItem } from '@/types';
import { formatPrice, formatDate } from '@/utils/helpers';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItemsMap, setOrderItemsMap] = useState<Map<string, OrderItem[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await fetchAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    try {
      if (!orderItemsMap.has(orderId)) {
        const items = await fetchOrderItems(orderId);
        setOrderItemsMap(new Map(orderItemsMap).set(orderId, items));
      }
      setExpandedOrder(orderId);
    } catch (error) {
      console.error('Error loading order items:', error);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statuses: Order['status'][] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-gray-900">
          Orders
        </h1>
        <p className="text-gray-600 mt-2">
          Manage customer orders and shipments
        </p>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {orders.map((order) => (
            <motion.div
              key={order.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between"
                onClick={() => handleExpandOrder(order.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-display font-bold text-gray-900 text-lg">
                      Order {order.id.substring(0, 8).toUpperCase()}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Customer Email</p>
                      <p className="font-semibold text-gray-900">
                        {order.user_email}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Shipping</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        PUDO {order.pudo_size}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-4"
                >
                  <ChevronDown size={24} />
                </motion.div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrder === order.id && (
                <motion.div
                  className="border-t border-gray-200 p-6 bg-gray-50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Shipping Address */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Shipping Address
                    </h4>
                    <div className="bg-white p-4 rounded-lg text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-semibold">Name:</span>{' '}
                        {order.shipping_address?.full_name}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{' '}
                        {order.shipping_address?.email}
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span>{' '}
                        {order.shipping_address?.phone}
                      </p>
                      <p>
                        <span className="font-semibold">PUDO Location:</span>{' '}
                        {order.shipping_address?.pudo_location}
                      </p>
                      <p>
                        <span className="font-semibold">City/Province:</span>{' '}
                        {order.shipping_address?.city}, {order.shipping_address?.province}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {orderItemsMap.get(order.id) && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Items Ordered
                      </h4>
                      <div className="space-y-2">
                        {orderItemsMap.get(order.id)?.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center bg-white p-4 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {item.product?.name || 'Product Deleted'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Summary */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Order Summary
                    </h4>
                    <div className="bg-white p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>{formatPrice(order.shipping_cost)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Update Status
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                      {statuses.map((status) => (
                        <motion.button
                          key={status}
                          onClick={() => handleStatusUpdate(order.id, status)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition capitalize ${
                            order.status === status
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-900'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {status === order.status && (
                            <CheckCircle2 size={16} className="inline mr-1" />
                          )}
                          {status}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="text-center py-12 bg-gray-50 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-gray-600 text-lg">
            No orders yet. Customer orders will appear here.
          </p>
        </motion.div>
      )}
    </div>
  );
}
