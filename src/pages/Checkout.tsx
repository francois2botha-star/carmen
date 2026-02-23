import React, { useState } from 'react';
import { useCartStore } from '../store/cart';
import Input from '../components/Input';
import Button from '../components/Button';
import { SHIPPING_RATES, WHATSAPP_NUMBER, STORE_NAME } from '../config/storeConfig';
import axios from 'axios';

const provinces = Object.keys(SHIPPING_RATES);

const Checkout: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [province, setProvince] = useState(provinces[0] || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = SHIPPING_RATES[province] || 0;
  const total = cartTotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    if (!customerName) {
      setErrors(err => ({ ...err, name: 'Name required' }));
      setSubmitting(false);
      return;
    }
    if (!customerPhone) {
      setErrors(err => ({ ...err, phone: 'Phone required' }));
      setSubmitting(false);
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/orders/create`, {
        customer_name: customerName,
        customer_phone: customerPhone,
        province,
        cart: items,
        total,
      });
      setSuccess(true);
      clearCart();
    } catch {
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappMsg = encodeURIComponent(
    `Hi ${STORE_NAME},\n\nOrder details:\n${items.map(i => `${i.name} x${i.quantity}`).join(', ')}\nTotal: R${total.toFixed(2)}\nName: ${customerName}\nPhone: ${customerPhone}\nProvince: ${province}`
  );
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {items.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : success ? (
        <div className="bg-green-100 p-4 rounded">Order submitted! <a href={whatsappLink} target="_blank" rel="noopener" className="underline text-green-700">Send WhatsApp</a></div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
          {errors.name && <div className="text-red-600 text-xs">{errors.name}</div>}
          <Input label="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
          {errors.phone && <div className="text-red-600 text-xs">{errors.phone}</div>}
          <div>
            <label className="block mb-1 font-medium">Province</label>
            <select value={province} onChange={e => setProvince(e.target.value)} className="border rounded px-3 py-2 w-full">
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="font-bold">Shipping: R{shipping.toFixed(2)}</div>
          <div className="font-bold">Total: R{total.toFixed(2)}</div>
          <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Order'}</Button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
