import React from 'react';

interface ProductFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ categories, selected, onSelect }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    <button
      className={`px-3 py-1 rounded ${selected === '' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      onClick={() => onSelect('')}
    >
      All
    </button>
    {categories.map((cat) => (
      <button
        key={cat}
        className={`px-3 py-1 rounded ${selected === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        onClick={() => onSelect(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default ProductFilter;
