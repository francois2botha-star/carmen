import React from 'react';
import { Product } from '../types/Product';
import Button from './Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => (
  <div className="bg-white rounded shadow p-4 flex flex-col">
    <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2 rounded" />
    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
    <div className="flex justify-between items-center mb-2">
      <span className="text-blue-600 font-semibold">R{product.price.toFixed(2)}</span>
      {product.isSpecial && <span className="bg-yellow-300 text-xs px-2 py-1 rounded">Special</span>}
    </div>
    <Button onClick={() => onAddToCart(product)}>Add to Cart</Button>
  </div>
);

export default ProductCard;
