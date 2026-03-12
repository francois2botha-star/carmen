# Carmen Boutique WhatsApp Store

Simple ecommerce-style catalog for selling clothes, shoes, perfumes, and more where checkout is handled through WhatsApp.

## Features

- Public storefront with products, categories, options (sizes, ml, etc.), prices, and stock status
- Storefront category filter for quick browsing
- Admin storefront setting to hide out-of-stock products from public view
- Admin panel to add products with images
- Custom category support from admin panel
- Edit existing products (name, description, price, options, category, stock, image)
- Delete products from admin panel
- Product data stored in Supabase Postgres
- Product images stored in Cloudinary
- "Order on WhatsApp" button with pre-filled order message

## Local setup

1. Install dependencies:
   npm install
2. Create .env from .env.example and fill all values.
3. Run app:
   npm run dev
4. Open:
   - Store: http://localhost:3000
   - Admin: http://localhost:3000/admin

## Free deployment: Render + Supabase + Cloudinary

1. Create a Supabase project.
2. In Supabase, open Project Settings, then Database, then copy your Connection string.
3. Create a Cloudinary account and copy:
   - cloud name
   - api key
   - api secret
4. Push this project to a GitHub repository.
5. In Render, create a new Web Service from your GitHub repo.
6. Render settings:
   - Build command: npm install
   - Start command: npm start
7. Add these environment variables in Render:
   - ADMIN_PASSWORD
   - WHATSAPP_NUMBER
   - SUPABASE_DATABASE_URL
   - DATABASE_SSL=true
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
8. Deploy. The app auto-creates required tables on first start.

## Notes

- Main sales channel remains WhatsApp.
- Delivery can still be managed manually via Pudo / The Courier Guy.
- Free Render services can sleep when inactive, so first request may be slow.

## Keep Render service awake (optional)

This app includes an optional keep-alive pinger and a health endpoint.

- Health endpoint: `/health`
- Env vars:
   - `KEEP_ALIVE_ENABLED=true`
   - `KEEP_ALIVE_URL=https://your-service-name.onrender.com/health`
   - `KEEP_ALIVE_INTERVAL_MINUTES=10`

Recommended:
- Set interval to `10` (or any value under 15 minutes).
- Keep this disabled in local dev.
