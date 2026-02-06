import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchAllOrders } from '@/services/orderService';
import { fetchProducts as fetchAllProducts } from '@/services/productService';
import { Order, Product } from '@/types';
import { formatPrice, formatDate } from '@/utils/helpers';
import { TrendingUp, ShoppingBag, Package, DollarSign } from 'lucide-react';

export function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          fetchAllOrders().catch(() => []),
          fetchAllProducts().catch(() => []),
        ]);
        setOrders(ordersData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Revenue',
      value: formatPrice(orders.reduce((sum, order) => sum + order.total, 0)),
      icon: DollarSign,
      color: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Pending Orders',
      value: orders.filter(o => o.status === 'pending').length,
      icon: TrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
  ];

  const recentOrders = orders.slice(0, 5);

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
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="font-display text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
          Recent Orders
        </h2>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-xs">
                      {order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{order.user_email}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(order.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No orders yet.</p>
        )}
      </motion.div>
    </div>
  );
}
