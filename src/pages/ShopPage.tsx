import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts, fetchCategories } from '@/services/productService';
import { Product } from '@/types';
import { formatPrice } from '@/utils/helpers';
import { ChevronRight, Star, Filter } from 'lucide-react';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Shop
          </h1>
          <p className="text-gray-600">
            Discover our complete collection of premium products
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden w-full flex items-center space-x-2 mb-6 p-4 border border-gray-200 rounded-lg"
            >
              <Filter size={20} />
              <span className="font-semibold">Filters</span>
            </button>

            {/* Filter Panel */}
            <motion.div
              className={`space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                  <Filter size={20} />
                  <span>Categories</span>
                </h3>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setMobileFilterOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition ${
                      selectedCategory === 'all'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Products
                  </button>

                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setMobileFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedCategory === category
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 text-sm">
                    Showing {filteredProducts.length} products
                  </p>
                </div>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredProducts.map((product) => (
                    <motion.div key={product.id} variants={item}>
                      <Link to={`/product/${product.id}`}>
                        <div className="card overflow-hidden h-full flex flex-col">
                          {/* Product Image */}
                          <div className="aspect-square bg-gray-100 overflow-hidden relative group">
                            {product.images[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <span className="text-6xl">📦</span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-6 flex-grow flex flex-col">
                            <h3 className="font-display text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                              {product.description}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center space-x-1 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className="fill-yellow-400 text-yellow-400"
                                />
                              ))}
                              <span className="text-xs text-gray-600 ml-2">
                                (12)
                              </span>
                            </div>

                            {/* Price & CTA */}
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-display text-xl font-bold text-gray-900">
                                {formatPrice(product.price)}
                              </span>
                              <button className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
