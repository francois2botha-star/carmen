import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Components
import { MainLayout } from '@/components/MainLayout';
import { AdminRoute } from '@/components/AdminRoute';

// Public Pages
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductPage } from '@/pages/ProductPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';

// Admin Pages
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminLayout } from '@/pages/AdminLayout';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/AdminOrdersPage';

// Styles
import '@/index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/carmen">
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">
                    404
                  </h1>
                  <p className="text-gray-600 mb-6">Page not found</p>
                  <a href="/" className="btn-primary inline-block">
                    Back Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
