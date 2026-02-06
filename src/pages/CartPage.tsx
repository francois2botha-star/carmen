import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/helpers';
import { calculateShipping } from '@/utils/shipping';
import { Trash2, ChevronRight, ShoppingCart } from 'lucide-react';

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore(state => state.items);
  const subtotal = useCartStore(state => state.getSubtotal());
  const totalWeight = useCartStore(state => state.getTotalWeight());
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);

  const shipping = calculateShipping(totalWeight);
  const total = subtotal + shipping.price;

  if (items.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8 max-w-md">
            Looks like you haven't added anything to your cart yet. Browse our
            collection and find something you love!
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center space-x-2">
            <span>Continue Shopping</span>
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <motion.h1
        className="font-display text-4xl font-bold text-gray-900 mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Shopping Cart
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.product.id}
                className="flex gap-6 p-6 border border-gray-200 rounded-lg hover:shadow-lg transition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Product Image */}
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-display text-lg font-bold text-gray-900 hover:text-gray-700 transition"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {item.product.description}
                    </p>
                  </div>

                  {/* Price Info */}
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-gray-600 text-sm">
                        {formatPrice(item.product.price)} each
                      </p>
                      <p className="font-display text-xl font-bold text-gray-900">
                        {formatPrice(
                          item.product.price * item.quantity
                        )}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-3 py-2 hover:bg-gray-100 transition"
                        >
                          −
                        </button>
                        <span className="px-4 py-2 font-semibold text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="px-3 py-2 hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Continue Shopping */}
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/shop" className="text-gray-600 hover:text-gray-900 transition flex items-center space-x-2">
              <ChevronRight size={20} className="rotate-180" />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        </div>

        {/* Order Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-gray-50 rounded-xl p-8 sticky top-24">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Shipping (PUDO - {shipping.size})
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(shipping.price)}
                </span>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-1">Weight: {totalWeight}kg</p>
                <p>
                  Your order will be delivered via PUDO{' '}
                  <span className="capitalize font-semibold">{shipping.size}</span> locker
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline mb-8">
              <span className="text-gray-600 text-lg">Total</span>
              <span className="font-display text-3xl font-bold text-gray-900">
                {formatPrice(total)}
              </span>
            </div>

            {/* Checkout Button */}
            <motion.button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Proceed to Checkout</span>
              <ChevronRight size={20} />
            </motion.button>

            {/* Trust Signals */}
            <div className="mt-8 space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-lg">✓</span>
                <span>Secure checkout with PayFast</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🚚</span>
                <span>Fast PUDO delivery across SA</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">✓</span>
                <span>100% money-back guarantee</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
