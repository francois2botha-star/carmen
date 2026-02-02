# Carmen E-commerce Deployment Guide

## Requirements

- Node.js 16+ and npm
- Supabase account
- South Africa hosting (Cybersmart, Afrihost, Hetzner, etc.)
- Domain name

## Step 1: Build the Application

```bash
# Install dependencies
npm install

# Create production build
npm run build

# This creates the `/dist` folder with all static files
```

## Step 2: Prepare Supabase

1. Create a Supabase project
2. Go to SQL Editor
3. Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`
4. Create a storage bucket named `product-images`
5. Create an admin user:
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
   VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'admin@carmen.shop',
     crypt('your-secure-password', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW()
   );
   
   -- Then add to admin_users
   INSERT INTO admin_users (id, email, role)
   SELECT id, email, 'super_admin' FROM auth.users WHERE email = 'admin@carmen.shop';
   ```

## Step 3: Environment Variables

1. Get your Supabase credentials:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

2. Create `.env.local`:
   ```
   VITE_SUPABASE_URL=your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_PAYFAST_MERCHANT_ID=your-merchant-id
   VITE_PAYFAST_MERCHANT_KEY=your-merchant-key
   VITE_PAYFAST_PASSPHRASE=your-passphrase
   VITE_PAYFAST_SANDBOX=true
   ```

## Step 4: Deploy to Shared Hosting (Apache)

### Via FTP/SFTP:

1. Connect to your hosting via FTP
2. Upload all files from `/dist` folder to `public_html` or `www` folder
3. Upload `.htaccess` file to the same directory
4. Done! Your site is live

### Via cPanel (if available):

1. Create a new addon domain for your site
2. Upload `/dist` files to the public_html folder
3. Upload `.htaccess` to same location
4. Configure SSL in AutoSSL

### Via SSH (if available):

```bash
# SSH into your server
ssh user@yourdomain.com

# Navigate to web root
cd public_html

# Upload the dist folder contents
# Using scp from your local machine:
scp -r dist/* user@yourdomain.com:~/public_html/

# Upload .htaccess
scp .htaccess user@yourdomain.com:~/public_html/
```

## Step 5: Deploy to Nginx/VPS

1. SSH into your VPS
2. Install Node.js and npm
3. Clone your repository
4. Install dependencies: `npm install`
5. Build: `npm run build`
6. Copy nginx.conf to `/etc/nginx/sites-available/carmen`
7. Enable site: `ln -s /etc/nginx/sites-available/carmen /etc/nginx/sites-enabled/`
8. Test: `nginx -t`
9. Reload: `systemctl reload nginx`

## Step 6: Domain Configuration

1. Point your domain to your hosting nameservers
2. Wait for DNS propagation (24-48 hours)
3. Set up SSL:
   - For cPanel: Use AutoSSL
   - For Nginx: Use Let's Encrypt
     ```bash
     sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
     ```

## Step 7: Configure PayFast

1. Sign up at payfast.io
2. Get merchant credentials
3. Update `.env.local` with credentials
4. Test in sandbox mode first
5. Go live when ready

## Troubleshooting

### 404 on page reload
- Make sure `.htaccess` (Apache) or `nginx.conf` (Nginx) is in place
- These files handle React Router navigation

### Images not loading
- Check Supabase Storage bucket permissions
- Ensure bucket is set to `public`
- Check image URLs in product database

### Payment not working
- Verify PayFast credentials
- Check email address matches PayFast account
- Ensure SSL certificate is installed
- Check PayFast return URLs in code

### Slow loading
- Enable gzip compression (configured in .htaccess/nginx.conf)
- Set proper cache headers
- Optimize images before upload
- Use CDN if available

## Performance Tips

1. **Optimize Images**: Compress product images before upload
2. **Enable Caching**: .htaccess and nginx.conf already configured
3. **Use CDN**: Configure CloudFlare for your domain
4. **Monitor Performance**: Use Supabase dashboard

## Backup & Maintenance

Regular tasks:
- Back up Supabase database monthly
- Review order logs
- Update dependencies: `npm update`
- Monitor uptime

## Support

- Supabase Docs: https://supabase.com/docs
- PayFast Docs: https://www.payfast.co.za/
- React Router: https://reactrouter.com/
