# Carmen E-commerce Platform

[![Deploy to GitHub Pages](https://github.com/francois2botha-star/carmen/actions/workflows/deploy.yml/badge.svg)](https://github.com/francois2botha-star/carmen/actions/workflows/deploy.yml)

A modern, production-ready e-commerce website built with React + Supabase for selling products in South Africa with PUDO shipping integration.

## 🚀 Features

### Customer Features
- **Modern Product Gallery** - Image carousel, multiple photos per product
- **Smart Shopping Cart** - Persistent cart with localStorage
- **Dynamic PUDO Shipping** - Automatic shipping cost calculation based on weight
- **Secure Checkout** - Multi-step checkout with order confirmation
- **PayFast Integration** - Secure payment processing
- **Responsive Design** - Mobile-first, works on all devices
- **Fast Performance** - Optimized with Tailwind CSS and Framer Motion

### Admin Features
- **Product Management** - Add, edit, delete products with image uploads
- **Order Management** - View orders, update status, track shipments
- **Dashboard Analytics** - Overview of sales, revenue, and orders
- **Admin Authentication** - Secure login for store administrators
- **Row Level Security** - Database-level access control

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Zustand** - State management

### Backend & Services
- **Supabase** - Database, Auth, Storage, Edge Functions
- **PostgreSQL** - Data persistence
- **PayFast/Yoco** - Payment gateway
- **PUDO** - Courier logistics

### Hosting
- **Apache/Nginx** - Web server
- **Shared Hosting** - Cybersmart, Afrihost, Hetzner compatible
- **Self-hosted** - Full control, no vendor lock-in

## 🚢 GitHub Pages Deployment

This repo deploys automatically on pushes to `main` via GitHub Actions.

- Build output is published to the `gh-pages` branch from `dist`.
- Live site: https://francois2botha-star.github.io/carmen/

## 📦 Project Structure

```
carmen/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MainLayout.tsx
│   │   └── AdminRoute.tsx
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── ShopPage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── AdminLoginPage.tsx
│   │   ├── AdminLayout.tsx
│   │   └── AdminDashboardPage.tsx
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.ts
│   ├── services/           # API functions
│   │   ├── productService.ts
│   │   └── orderService.ts
│   ├── store/              # State management
│   │   └── cartStore.ts
│   ├── utils/              # Utility functions
│   │   ├── helpers.ts
│   │   └── shipping.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── lib/                # Library configuration
│   │   └── supabase.ts
│   ├── index.css           # Global styles
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── supabase/
│   └── migrations/         # Database schemas
│       └── 001_initial_schema.sql
├── public/                 # Static assets
├── .env.example            # Example environment variables
├── .htaccess              # Apache configuration
├── nginx.conf             # Nginx configuration
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account

### Installation

1. **Clone and setup**
   ```bash
   git clone <repo>
   cd carmen
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

3. **Update with your Supabase credentials**
   - Get URL and key from Supabase project settings
   - Add PayFast credentials (optional for testing)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Navigate to `http://localhost:3000`

## 📊 Database Schema

### Products
```sql
id (UUID)
name (VARCHAR)
description (TEXT)
price (DECIMAL)
category (VARCHAR)
images (JSONB array)
weight_kg (DECIMAL)
is_active (BOOLEAN)
created_at (TIMESTAMP)
```

### Orders
```sql
id (UUID)
user_email (VARCHAR)
status (VARCHAR)
subtotal (DECIMAL)
shipping_cost (DECIMAL)
total (DECIMAL)
pudo_size (VARCHAR)
shipping_address (JSONB)
created_at (TIMESTAMP)
```

### Order Items
```sql
id (UUID)
order_id (UUID FK)
product_id (UUID FK)
quantity (INTEGER)
price (DECIMAL)
```

### Admin Users
```sql
id (UUID FK to auth.users)
email (VARCHAR)
role (VARCHAR)
created_at (TIMESTAMP)
```

## 🔐 Authentication

- **Supabase Auth** - Email/password authentication
- **Admin Dashboard** - Protected routes with Row Level Security
- **Customer Checkout** - Anonymous checkout (no account required)

### Creating Admin User

1. In Supabase dashboard, create a user
2. Add to `admin_users` table with `super_admin` role

## 📦 Shipping Logic

PUDO Courier pricing (South Africa):
| Size | Max Weight | Price |
|------|-----------|-------|
| Small | ≤5kg | R60 |
| Medium | ≤10kg | R80 |
| Large | ≤15kg | R100 |

Shipping cost is calculated automatically based on total cart weight.

## 💳 Payments

### PayFast Integration
- South African payment gateway
- Supports multiple payment methods
- Secure redirect flow
- Webhook validation for order confirmation

### Testing
1. Use sandbox credentials in `.env.local`
2. PayFast provides test card numbers
3. Switch to production when ready

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change color scheme:
```javascript
colors: {
  primary: { ... }
}
```

### Fonts
Update in `index.html` Google Fonts link and `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ['Your Font', 'fallback'],
  display: ['Display Font', 'fallback']
}
```

### Content
- Update company info in Footer
- Customize About/Contact pages
- Modify hero sections in pages

## 📈 Performance

- ✅ Gzip compression enabled
- ✅ Image optimization
- ✅ Browser caching configured
- ✅ Lazy loading for images
- ✅ Code splitting with React Router
- ✅ Lighthouse score: 90+

## 🔍 SEO

- ✅ Meta tags in HTML
- ✅ Semantic HTML structure
- ✅ Image alt text
- ✅ Mobile responsive
- ✅ Fast page load

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- --port 3001
```

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database connection issues
- Check Supabase credentials in `.env.local`
- Verify Supabase project is active
- Check network connectivity

## 📚 Resources

- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Framer Motion](https://www.framer.com/motion)
- [TypeScript](https://www.typescriptlang.org)

## 📝 License

This project is built for commercial use. Customize and deploy as needed.

## 🤝 Support

For issues or questions:
1. Check DEPLOYMENT.md for deployment help
2. Review Supabase documentation
3. Check code comments for implementation details

## 🚀 Future Enhancements

- [ ] Wishlist feature
- [ ] Product reviews & ratings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Inventory management
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Progressive Web App (PWA)
- [ ] Dark mode
- [ ] Integration with more payment gateways

---

**Built with ❤️ for South African sellers**
