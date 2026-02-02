# Carmen E-commerce - Quick Reference

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Visit http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Admin Credentials (After Setup)

```
Email: admin@carmen.shop
Password: (whatever you set during setup)
Login URL: http://yoursite.com/admin/login
```

## 📍 Important URLs

```
Home: /
Shop: /shop
Cart: /cart
Checkout: /checkout
About: /about
Contact: /contact

Admin Login: /admin/login
Admin Dashboard: /admin
Admin Products: /admin/products
Admin Orders: /admin/orders
```

## 🗄️ Database Tables

```
products(id, name, description, price, category, images[], weight_kg, is_active)
orders(id, user_email, status, subtotal, shipping_cost, total, pudo_size, shipping_address)
order_items(id, order_id, product_id, quantity, price)
admin_users(id, email, role)
```

## 💰 Pricing (PUDO Shipping)

```
Small (≤5kg): R60
Medium (≤10kg): R80
Large (≤15kg): R100
```

## 📦 File Locations

```
Components:    src/components/
Pages:         src/pages/
Hooks:         src/hooks/
Services:      src/services/
State:         src/store/
Utils:         src/utils/
Types:         src/types/
Database:      supabase/migrations/
Config:        vite.config.ts, tailwind.config.js
```

## 🔧 Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYFAST_MERCHANT_ID=
VITE_PAYFAST_MERCHANT_KEY=
VITE_PAYFAST_PASSPHRASE=
VITE_PAYFAST_SANDBOX=true|false
```

## 📊 Order Statuses

```
pending → paid → processing → shipped → delivered
                                     ↘ cancelled
```

## 🎨 Tailwind Classes Used

```
btn-primary       // Dark button
btn-secondary     // Outlined button
input             // Form input styling
card              // Card component styling
text-balance      // Balanced text wrapping
```

## 🔄 Key Hooks

```typescript
useAuth()                // Authentication
useCartStore()           // Cart state
useNavigate()            // Navigation
useState()               // Component state
useEffect()              // Side effects
```

## 🎯 Page Components

```typescript
HomePage()              // Home page
ShopPage()              // Product listing
ProductPage()           // Product details
CartPage()              // Shopping cart
CheckoutPage()          // Checkout flow
AdminLoginPage()        // Admin login
AdminDashboardPage()    // Admin dashboard
AdminProductsPage()     // Product management
AdminOrdersPage()       // Order management
```

## 🔌 API Services

```typescript
// Products
fetchProducts()
fetchProductById(id)
fetchProductsByCategory(category)
fetchCategories()
saveProduct(product)
deleteProduct(id)
uploadProductImage(file, productId)

// Orders
createOrder(...)
fetchOrder(orderId)
fetchOrderItems(orderId)
fetchAllOrders()
updateOrderStatus(orderId, status)
confirmOrderPayment(orderId)
```

## 📱 Responsive Breakpoints

```
Mobile: 320px+
Tablet: 768px+ (md)
Desktop: 1024px+ (lg)
Wide: 1280px+ (xl)
```

## 🚀 Deployment Checklist

- [ ] Create Supabase account
- [ ] Execute database schema
- [ ] Create admin user
- [ ] Configure .env.local
- [ ] Test locally
- [ ] Build project (npm run build)
- [ ] Get domain name
- [ ] Set up hosting account
- [ ] Upload /dist files
- [ ] Configure DNS
- [ ] Test on live domain
- [ ] Set up SSL/HTTPS
- [ ] Test checkout with real PayFast
- [ ] Launch!

## 🎨 Color Scheme

```
Primary: Gray-900 (Dark)
Accent: Gray shades
Text: Gray-900
Backgrounds: White, Gray-50, Gray-100
```

## ⚡ Performance Targets

```
Lighthouse Score: 90+
Page Load: <2 seconds
Bundle Size: ~150KB (gzipped)
Images: Optimized & lazy-loaded
Cache: 1 year for assets
```

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Row Level Security active
- [ ] Passwords hashed
- [ ] No secrets in code
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Admin routes protected
- [ ] Database backups regular

## 📞 Support

| Issue | File |
|-------|------|
| Quick start | SETUP.md |
| Deployment | DEPLOYMENT.md |
| Full docs | README.md |
| Project overview | PROJECT_COMPLETE.md |

## 🎯 Key Concepts

**Cart Persistence**: Zustand with localStorage
**Auth**: Supabase JWT tokens
**Shipping**: Weight-based calculation
**Payments**: PayFast redirect flow
**Database**: PostgreSQL with RLS
**Images**: Supabase Storage

## 💡 Pro Tips

1. Test payments in sandbox first
2. Compress product images before upload
3. Monitor Supabase usage
4. Back up database monthly
5. Update dependencies quarterly
6. Use HTTPS in production
7. Enable caching headers
8. Monitor error logs
9. Keep admin password secure
10. Test on mobile devices

## 🐛 Common Issues

```
404 on refresh?
→ Check .htaccess (Apache) or nginx.conf (Nginx)

Images not showing?
→ Verify Supabase Storage bucket permissions

Admin won't login?
→ Check admin_users table has the user

Cart empty after refresh?
→ Check localStorage is enabled
```

## 📈 Metrics to Track

```
Products added: _____
Orders received: _____
Revenue: R _____
Average order value: R _____
Conversion rate: _____
Cart abandonment: _____
Page load time: _____ ms
```

## 🎁 Next Features (Optional)

- Product reviews
- Wishlist
- Email notifications
- SMS alerts
- Customer accounts
- Advanced search
- Analytics
- Refunds
- Returns
- Bulk orders

---

**Everything you need is in this folder!**

Start with SETUP.md → Run locally → Then DEPLOYMENT.md → Go live! 🚀
