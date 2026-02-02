import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts } from '@/services/productService';
import { Product } from '@/types';
import { formatPrice } from '@/utils/helpers';
import { ChevronRight, Star } from 'lucide-react';

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchProducts();
        // Get first 6 products as featured
        setFeaturedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gray-900 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Content */}
            <div>
              <motion.h1
                className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Curated Collections for the Modern You
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Discover premium products handpicked with care. From fashion to lifestyle, find everything you love in one place.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Link
                  to="/shop"
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <span>Start Shopping</span>
                  <ChevronRight size={20} />
                </Link>
                <Link
                  to="/about"
                  className="btn-secondary flex items-center justify-center"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div
              className="relative h-96 md:h-full hidden md:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center">
                <div className="text-gray-400 text-center">
                  <div className="w-32 h-32 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">🛍️</span>
                  </div>
                  <p>Featured Image Area</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Collections
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our latest arrivals and customer favorites
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={item}>
                  <Link to={`/product/${product.id}`}>
                    <div className="card overflow-hidden">
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
                        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                          New
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">(24)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="font-display text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          <button className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* View All Button */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link
              to="/shop"
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <span>View All Products</span>
              <ChevronRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-block p-3 bg-white rounded-lg mb-4">
                <span className="text-4xl">🚚</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">
                PUDO courier delivery throughout South Africa
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="inline-block p-3 bg-white rounded-lg mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">
                Quality Guaranteed
              </h3>
              <p className="text-gray-600">
                100% authentic products, handpicked with care
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="inline-block p-3 bg-white rounded-lg mb-4">
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Secure Payment</h3>
              <p className="text-gray-600">
                Safe checkout with PayFast or Yoco payment gateway
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
