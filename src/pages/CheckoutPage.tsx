import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/services/orderService';
import { getShippingSizeLabel, calculateShippingSize, calculateShippingCost } from '@/utils/shipping';
import { getPudoShippingQuote } from '@/services/pudoService';
import { formatPrice } from '@/utils/helpers';
import type { CheckoutData } from '@/types';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getTotalWeight, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutData>({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const subtotal = getTotalPrice();
  const totalWeight = getTotalWeight();
  const shippingSize = calculateShippingSize(totalWeight);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const total = subtotal + (shippingCost ?? 0);
  // Example locker codes, replace with real values or let user select
  const DEFAULT_ORIGIN_LOCKER = 'JHB01';
  const DEFAULT_DEST_LOCKER = 'CPT02';
  const parcelDimensions = { length: 30, width: 20, height: 10 };
  // Fetch shipping cost from Pudo API
  const fetchShippingCost = async () => {
    setShippingLoading(true);
    const origin = formData.originLocker || DEFAULT_ORIGIN_LOCKER;
    const destination = formData.destLocker || DEFAULT_DEST_LOCKER;
    try {
      const quote = await getPudoShippingQuote({
        origin,
        destination,
        weight: totalWeight,
        dimensions: parcelDimensions,
        service_type: 'locker-to-locker',
      });
      setShippingCost(quote.quote.amount);
    } catch (error) {
      // If Pudo fails, fall back to local rate table so users can continue checkout
      console.warn('Pudo quote failed, using fallback shipping rate:', error);
      const fallback = calculateShippingCost(totalWeight);
      setShippingCost(fallback);
      alert('Pudo shipping unavailable — using fallback shipping rate.');
    } finally {
      setShippingLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitInfo = async (e: React.FormEvent | null) => {
    if (e && 'preventDefault' in e) (e as React.FormEvent).preventDefault();
    await fetchShippingCost();
    setStep(2);
  };

  // Dev-only: support /checkout?autoCheckout=1 to run a full checkout automatically on localhost
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoCheckout') === '1' && window.location.hostname.includes('localhost')) {
      (async () => {
        // pre-fill with test data
        setFormData({
          email: 'test@example.com',
          name: 'Test User',
          phone: '+27123456789',
          address: '123 Test St',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
        });
        // ensure shipping cost is fetched
        await fetchShippingCost();
        setStep(2);
        // place order after a short delay
        setTimeout(() => {
          handlePlaceOrder();
        }, 800);
      })();
    }
  }, []);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        user_email: formData.email,
        user_name: formData.name,
        user_phone: formData.phone,
        subtotal,
        shipping_cost: shippingCost ?? 0,
        total,
        pudo_size: shippingSize,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.province}, ${formData.postalCode}`,
      };

      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const order = await createOrder(orderData, orderItems);
      clearCart();
      navigate(`/checkout/success?orderId=${order.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      let message = 'Failed to place order. Please try again.';
      if (error) {
        if (typeof error === 'object') {
          message += '\n' + JSON.stringify(error, null, 2);
          if (error.details) message += '\nDetails: ' + error.details;
          if (error.hint) message += '\nHint: ' + error.hint;
        } else if (typeof error === 'string') {
          message += '\n' + error;
        }
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step > 1 ? <Check className="w-5 h-5" /> : '1'}
          </div>
          <div className="w-24 h-1 bg-gray-200 mx-2">
            <div className={`h-full ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />
          </div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <form onSubmit={handleSubmitInfo} className="card">
              <h2 className="font-display text-2xl font-bold mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input w-full"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input w-full"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="input w-full"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="input w-full"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">PUDO Locker Code (optional)</label>
                  <input
                    type="text"
                    name="destLocker"
                    className="input w-full"
                    placeholder="e.g. CPT02 (leave blank to use address)"
                    value={formData.destLocker || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="input w-full"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Province</label>
                    <select
                      name="province"
                      required
                      className="input w-full"
                      value={formData.province}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Province</option>
                      <option value="Gauteng">Gauteng</option>
                      <option value="Western Cape">Western Cape</option>
                      <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                      <option value="Eastern Cape">Eastern Cape</option>
                      <option value="Free State">Free State</option>
                      <option value="Limpopo">Limpopo</option>
                      <option value="Mpumalanga">Mpumalanga</option>
                      <option value="Northern Cape">Northern Cape</option>
                      <option value="North West">North West</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    className="input w-full"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  {shippingLoading ? 'Calculating Shipping...' : 'Continue to Review'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="card">
              <h2 className="font-display text-2xl font-bold mb-6">Review Order</h2>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Shipping To:</h3>
                <p className="text-gray-600">
                  {formData.name}<br />
                  {formData.address}<br />
                  {formData.city}, {formData.province}, {formData.postalCode}<br />
                  {formData.email}<br />
                  {formData.phone}
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  Edit Information
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Order Items:</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || shippingCost === null}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-display text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Shipping ({getShippingSizeLabel(shippingSize)})
                </span>
                <span>{shippingCost !== null ? formatPrice(shippingCost) : 'Calculating...'}</span>
              </div>
              <p className="text-xs text-gray-500">
                Total weight: {totalWeight.toFixed(2)}kg
              </p>
            </div>
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-xl">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
