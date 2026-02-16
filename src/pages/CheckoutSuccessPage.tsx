import { useLocation } from 'react-router-dom';

export const CheckoutSuccessPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-bold mb-6 text-pink-600">Thank you for your order!</h1>
      <p className="text-lg mb-4">Your order has been placed successfully.</p>
      {orderId && (
        <p className="text-md text-gray-700 mb-8">Order ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{orderId}</span></p>
      )}
      <a href="/shop" className="btn-primary">Continue Shopping</a>
    </div>
  );
};
