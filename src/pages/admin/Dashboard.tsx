import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { getOrders } from '../../services/orderService';
import { Product } from '../../types/Product';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ImageUpload from '../../components/ImageUpload';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [error, setError] = useState('');
  const token = localStorage.getItem('adminToken') || '';

  useEffect(() => {
    getProducts().then(setProducts);
    getOrders(token).then(setOrders);
  }, []);

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm(product);
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id, token);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await updateProduct(editing.id, form, token);
        setProducts(products.map(p => p.id === editing.id ? { ...p, ...form } as Product : p));
        setEditing(null);
        setForm({});
      } else {
        const res = await createProduct(form, token);
        setProducts([...products, res.data]);
        setForm({});
      }
    } catch {
      setError('Error saving product');
    }
  };

  const handleImageUpload = (url: string) => {
    setForm(f => ({ ...f, image: url }));
  };

  const [orders, setOrders] = useState<any[]>([]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <Input label="Name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Input label="Description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
        <Input label="Price" type="number" value={form.price?.toString() || ''} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))} required />
        <Input label="Image URL" value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} required />
        <Input label="Category" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
        <div>
          <label className="mr-2">Special:</label>
          <input type="checkbox" checked={!!form.isSpecial} onChange={e => setForm(f => ({ ...f, isSpecial: e.target.checked }))} />
        </div>
        <ImageUpload onUpload={handleImageUpload} />
        {error && <div className="text-red-600">{error}</div>}
        <Button type="submit">{editing ? 'Update' : 'Create'} Product</Button>
        {editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm({}); }}>Cancel</Button>}
      </form>
      <Button variant="secondary" onClick={handleLogout} className="mb-4">Logout</Button>
      <div>
        <h3 className="font-bold mb-2">Products</h3>
        <ul>
          {products.map(p => (
            <li key={p.id} className="flex items-center justify-between border-b py-2">
              <span>{p.name} (R{p.price.toFixed(2)})</span>
              <div>
                <Button variant="secondary" onClick={() => handleEdit(p)}>Edit</Button>
                <Button variant="secondary" onClick={() => handleDelete(p.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <h3 className="font-bold mb-2">Orders</h3>
        <ul>
          {orders.map(order => (
            <li key={order.id} className="border-b py-2">
              <div>Order #{order.id} - {order.customer_name} ({order.customer_phone})</div>
              <div>Province: {order.province}</div>
              <div>Cart: {order.cart}</div>
              <div>Total: R{order.total.toFixed(2)}</div>
              <div>Date: {order.created_at}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
