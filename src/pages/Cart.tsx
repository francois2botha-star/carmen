import React from 'react';
import { useCartStore } from '../store/cart';
import Button from '../components/Button';

const Cart: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) return;
    useCartStore.setState(state => ({
      items: state.items.map(item => item.id === id ? { ...item, quantity } : item)
    }));
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Cart</h2>
      {items.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <>
          <ul className="mb-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b py-2">
                <div>
                  <span className="font-semibold">{item.name}</span> x
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="border rounded w-16 mx-2"
                  />
                  <span className="ml-2 text-blue-600">R{item.price.toFixed(2)}</span>
                </div>
                <Button variant="secondary" onClick={() => removeFromCart(item.id)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <div className="font-bold mb-4">Total: R{total.toFixed(2)}</div>
          <Button onClick={clearCart} variant="secondary" className="mr-2">Clear Cart</Button>
          <Button onClick={() => window.location.href = '/checkout'}>Checkout</Button>
        </>
      )}
    </div>
  );
};

export default Cart;
