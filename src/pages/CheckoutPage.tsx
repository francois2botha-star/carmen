import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/services/orderService';
import { calculateShipping, formatShippingSize } from '@/utils/shipping';
import { formatPrice } from '@/utils/helpers';
import { ShippingAddress } from '@/types';
import { ArrowLeft, Check } from 'lucide-react';

export function CheckoutPage() {
  const navigate = useNavigate();
  const cartItems = useCartStore(state => state.items);
  const subtotal = useCartStore(state => state.getSubtotal());
  const totalWeight = useCartStore(state => state.getTotalWeight());
  const clearCart = useCartStore(state => state.clearCart);

  const shipping = calculateShipping(totalWeight);
  const total = subtotal + shipping.price;

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingData, setShippingData] = useState<ShippingAddress>({
    full_name: '',
    phone: '',
    email: '',
    pudo_location: '',
    city: '',
    province: '',
  });

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form
    if (!shippingData.full_name || !shippingData.phone || !shippingData.email || !shippingData.pudo_location) {
      alert('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order in database
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const newOrder = await createOrder(
        shippingData.email,
        subtotal,
        shipping.price,
        shipping.size,
        shippingData,
        orderItems
      );

      setOrderId(newOrder.id);
      setStep(3);
      clearCart();

      // In a real app, redirect to PayFast here
      // const paymentUrl = generatePayFastURL(newOrder);
      // window.location.href = paymentUrl;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Back to Shopping</span>
            <ArrowLeft className="rotate-180" size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        {step < 3 && (
          <div className="mb-12">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full font-semibold flex items-center justify-center ${
                      s <= step
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s < step ? <Check size={20} /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        s < step ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm">
              <span className={step >= 1 ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                Shipping
              </span>
              <span className={step >= 2 ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                Payment
              </span>
              <span className={step >= 3 ? 'font-semibold text-gray-900' : 'text-gray-600'}>
                Confirm
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-sm"
            >
              {/* Step 1: Shipping */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-6">
                      Shipping Address
                    </h2>
                  </div>

                  <form onSubmit={handleContinueToPayment} className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={shippingData.full_name}
                        onChange={handleShippingChange}
                        required
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingData.email}
                        onChange={handleShippingChange}
                        required
                        className="input"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingData.phone}
                        onChange={handleShippingChange}
                        required
                        className="input"
                        placeholder="+27 (0) 1 234 567"
                      />
                    </div>

                    {/* PUDO Location */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        PUDO Location *
                      </label>
                      <input
                        type="text"
                        name="pudo_location"
                        value={shippingData.pudo_location}
                        onChange={handleShippingChange}
                        required
                        className="input"
                        placeholder="E.g., Pick n Pay, Sandton City"
                      />
                      <p className="text-gray-600 text-sm mt-2">
                        Enter your preferred PUDO locker location
                      </p>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={shippingData.city}
                        onChange={handleShippingChange}
                        required
                        className="input"
                        placeholder="Johannesburg"
                      />
                    </div>

                    {/* Province */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Province *
                      </label>
                      <select
                        name="province"
                        value={shippingData.province}
                        onChange={handleShippingChange}
                        required
                        className="input"
                      >
                        <option value="">Select Province</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="North West">North West</option>
                        <option value="Western Cape">Western Cape</option>
                      </select>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Shipping Method:</span> PUDO{' '}
                        <span className="capitalize font-semibold">{shipping.size}</span> Locker
                      </p>
                      <p className="text-sm text-blue-900 mt-1">
                        <span className="font-semibold">Shipping Cost:</span>{' '}
                        {formatPrice(shipping.price)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="flex-1 btn-secondary"
                      >
                        Back to Cart
                      </button>
                      <button type="submit" className="flex-1 btn-primary">
                        Continue to Payment
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                      Payment Method
                    </h2>
                    <p className="text-gray-600">
                      You will be redirected to PayFast to complete your payment securely.
                    </p>
                  </div>

                  {/* Order Review */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-900">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-semibold">{formatPrice(shipping.price)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-display text-lg font-bold">
                          {formatPrice(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details Review */}
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-900">Shipping To</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{shippingData.full_name}</p>
                      <p>{shippingData.pudo_location}</p>
                      <p>{shippingData.city}, {shippingData.province}</p>
                      <p>{shippingData.email}</p>
                      <p>{shippingData.phone}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 btn-secondary"
                    >
                      Back
                    </button>
                    <motion.button
                      onClick={handlePayment}
                      disabled={loading}
                      className="flex-1 btn-primary disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? 'Processing...' : 'Pay Now'}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Check size={32} className="text-green-600" />
                    </div>
                  </div>

                  <div>
                    <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
                      Order Confirmed!
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Thank you for your purchase.
                    </p>
                  </div>

                  {orderId && (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <p className="text-sm text-blue-900 mb-2">Order Number:</p>
                      <p className="font-display text-2xl font-bold text-blue-900">
                        {orderId.toUpperCase().substring(0, 8)}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-6 rounded-lg text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      What Happens Next?
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>
                          You'll receive a confirmation email shortly
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>
                          Your order will be packaged and prepared for shipment
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>
                          PUDO courier will deliver to your selected location
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span>
                          You'll receive tracking information via email
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      onClick={() => navigate('/shop')}
                      className="flex-1 btn-secondary"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="flex-1 btn-primary"
                    >
                      Back Home
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          {step < 3 && (
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white rounded-xl p-8 shadow-sm sticky top-24">
                <h3 className="font-display text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h3>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Shipping ({formatShippingSize(shipping.size)})
                    </span>
                    <span className="font-semibold">{formatPrice(shipping.price)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-display text-xl font-bold text-gray-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
