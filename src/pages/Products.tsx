import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { Product } from '../types/Product';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import { useCartStore } from '../store/cart';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
      setCategories([...new Set(data.map((p: Product) => p.category))]);
    });
  }, []);

  const filtered = category
    ? products.filter((p) => p.category === category)
    : products;
  const searched = search
    ? filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : filtered;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Products</h2>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-xs mr-2"
        />
      </div>
      <ProductFilter categories={categories} selected={category} onSelect={setCategory} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {searched.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default Products;
