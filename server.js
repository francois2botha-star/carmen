require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');
const { v2: cloudinary } = require('cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PANEL_PASSWORD = process.env.ADMIN_PANEL_PASSWORD || '!Cowbell@abc!';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '27799692789';
const KEEP_ALIVE_ENABLED = String(process.env.KEEP_ALIVE_ENABLED || 'false').toLowerCase() === 'true';
const KEEP_ALIVE_URL = process.env.KEEP_ALIVE_URL || '';
const KEEP_ALIVE_INTERVAL_MINUTES = Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || 10;
const DEFAULT_CATEGORIES = ['Mens clothing', 'Womens clothing', 'Shoes', 'Perfume', 'Accessories'];
const ORDER_STATUSES = ['Pending', 'Payment received', 'Order shipped', 'Completed'];

const ADMIN_SESSION_COOKIE = 'carmen_admin_session';
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
const ADMIN_SESSION_VALUE = crypto
  .createHash('sha256')
  .update(`${ADMIN_PANEL_PASSWORD}|${process.env.ADMIN_SESSION_SALT || 'carmen-boutique'}`)
  .digest('hex');

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'postgres',
  ssl: { rejectUnauthorized: false }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 8 * 1024 * 1024
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function startKeepAlivePinger() {
  if (!KEEP_ALIVE_ENABLED) {
    return;
  }

  if (!KEEP_ALIVE_URL) {
    console.warn('Keep-alive is enabled but KEEP_ALIVE_URL is not set. Skipping keep-alive pinger.');
    return;
  }

  const safeIntervalMinutes = Math.max(1, KEEP_ALIVE_INTERVAL_MINUTES);
  const intervalMs = safeIntervalMinutes * 60 * 1000;

  const ping = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(KEEP_ALIVE_URL, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'carmen-keep-alive/1.0'
        }
      });
      console.log(`Keep-alive ping -> ${KEEP_ALIVE_URL} [${response.status}]`);
    } catch (error) {
      console.warn(`Keep-alive ping failed: ${error.message}`);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  ping();
  setInterval(ping, intervalMs);

  console.log(`Keep-alive pinger started: every ${safeIntervalMinutes} minute(s) -> ${KEEP_ALIVE_URL}`);
}

function parseOptions(rawOptions) {
  return (rawOptions || '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);
}

function normalizePhone(input) {
  return (input || '').replace(/[^0-9]/g, '');
}

function resolveCategory(category, customCategory) {
  const selected = (category || '').trim();
  if (selected === '__custom__') {
    return (customCategory || '').trim();
  }
  return selected;
}

function getCookie(req, cookieName) {
  const raw = req.headers.cookie || '';
  const cookies = raw.split(';').map((entry) => entry.trim()).filter(Boolean);
  const token = `${cookieName}=`;
  const found = cookies.find((entry) => entry.startsWith(token));
  if (!found) {
    return null;
  }
  return decodeURIComponent(found.slice(token.length));
}

function isAdminAuthenticated(req) {
  return getCookie(req, ADMIN_SESSION_COOKIE) === ADMIN_SESSION_VALUE;
}

function requireAdminAuth(req, res, next) {
  if (!isAdminAuthenticated(req)) {
    return res.redirect('/admin/login');
  }
  return next();
}

function toViewProduct(row) {
  return {
    ...row,
    optionsArray: (row.sizes || '').split(',').map((s) => s.trim()).filter(Boolean)
  };
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10, 2) NOT NULL,
      sizes TEXT NOT NULL,
      gender TEXT NOT NULL,
      image_path TEXT,
      image_public_id TEXT,
      in_stock BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id BIGSERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_images (
      id BIGSERIAL PRIMARY KEY,
      product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_path TEXT NOT NULL,
      image_public_id TEXT,
      sort_order INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      customer_alt_phone TEXT,
      delivery_address TEXT,
      delivery_city TEXT,
      delivery_province TEXT,
      delivery_postal_code TEXT,
      items_json JSONB NOT NULL,
      items_total NUMERIC(10, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const category of DEFAULT_CATEGORIES) {
    await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [category]);
  }

  await pool.query(`
    INSERT INTO categories (name)
    SELECT DISTINCT TRIM(gender)
    FROM products
    WHERE gender IS NOT NULL AND TRIM(gender) <> ''
    ON CONFLICT (name) DO NOTHING
  `);
}

async function fetchCategories() {
  const result = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
  return result.rows;
}

async function ensureCategoryExists(name) {
  const value = (name || '').trim();
  if (!value) {
    return;
  }
  await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [value]);
}

async function fetchProducts() {
  const result = await pool.query(`
    SELECT p.*, pi.image_path AS primary_image_path
    FROM products p
    LEFT JOIN LATERAL (
      SELECT image_path
      FROM product_images
      WHERE product_id = p.id
      ORDER BY sort_order ASC, id ASC
      LIMIT 1
    ) pi ON TRUE
    ORDER BY p.created_at DESC
  `);
  return result.rows.map(toViewProduct);
}

async function fetchOrders() {
  const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return result.rows;
}

async function uploadImageToCloudinary(file) {
  if (!file) {
    return { imagePath: null, imagePublicId: null };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'carmen-boutique' },
      (error, uploadResult) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          imagePath: uploadResult.secure_url,
          imagePublicId: uploadResult.public_id
        });
      }
    );

    stream.end(file.buffer);
  });
}

async function deleteCloudinaryImage(publicId) {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (_error) {
    // Ignore media cleanup failures to avoid blocking user actions.
  }
}

async function fetchProductImages(productId) {
  const result = await pool.query(
    `SELECT image_path, image_public_id, sort_order
     FROM product_images
     WHERE product_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [productId]
  );

  return result.rows;
}

async function fetchShopCategories() {
  const categories = await fetchCategories();
  return categories.map((row) => row.name);
}

async function renderAdminWithMessage(res, error, success) {
  const [products, categoryRows, orders] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchOrders()
  ]);

  return res.render('admin', {
    products,
    categoryOptions: categoryRows.map((row) => row.name),
    categories: categoryRows,
    orders,
    orderStatuses: ORDER_STATUSES,
    error,
    success
  });
}

app.get('/', async (req, res) => {
  try {
    const selectedCategory = (req.query.category || 'All').trim();
    const hasFilter = selectedCategory && selectedCategory !== 'All';

    let sql = 'SELECT * FROM products';
    const params = [];

    if (hasFilter) {
      params.push(selectedCategory);
      sql += ` WHERE gender = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const [productResult, categoryRows] = await Promise.all([
      pool.query(sql, params),
      fetchCategories()
    ]);

    const products = productResult.rows.map(toViewProduct);
    const categories = ['All', ...categoryRows.map((row) => row.name)];
    const safeSelectedCategory = categories.includes(selectedCategory) ? selectedCategory : 'All';

    return res.render('index', {
      products,
      categories,
      selectedCategory: safeSelectedCategory,
      whatsappNumber: normalizePhone(WHATSAPP_NUMBER)
    });
  } catch (_error) {
    return res.status(500).send('Could not load products.');
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (!productResult.rows.length) {
      return res.status(404).send('Product not found.');
    }

    const product = toViewProduct(productResult.rows[0]);
    const images = await fetchProductImages(id);

    const galleryImages = images.map((imageRow) => imageRow.image_path);
    if (product.image_path && !galleryImages.includes(product.image_path)) {
      galleryImages.unshift(product.image_path);
    }

    return res.render('product', {
      product: {
        ...product,
        galleryImages
      },
      categories: await fetchShopCategories(),
      whatsappNumber: normalizePhone(WHATSAPP_NUMBER)
    });
  } catch (_error) {
    return res.status(500).send('Could not load product page.');
  }
});

app.get('/cart', async (req, res) => {
  try {
    const [whatsappNumber, categories] = await Promise.all([
      Promise.resolve(normalizePhone(WHATSAPP_NUMBER)),
      fetchShopCategories()
    ]);
    return res.render('cart', { whatsappNumber, categories });
  } catch (_error) {
    return res.status(500).send('Could not load cart.');
  }
});

app.get('/profile', async (req, res) => {
  try {
    const [whatsappNumber, categories] = await Promise.all([
      Promise.resolve(normalizePhone(WHATSAPP_NUMBER)),
      fetchShopCategories()
    ]);
    return res.render('profile', { whatsappNumber, categories });
  } catch (_error) {
    return res.status(500).send('Could not load profile page.');
  }
});

app.get('/checkout', async (req, res) => {
  try {
    const [whatsappNumber, categories] = await Promise.all([
      Promise.resolve(normalizePhone(WHATSAPP_NUMBER)),
      fetchShopCategories()
    ]);
    return res.render('checkout', { whatsappNumber, categories });
  } catch (_error) {
    return res.status(500).send('Could not load checkout page.');
  }
});

app.get('/about', async (req, res) => {
  try {
    const [whatsappNumber, categories] = await Promise.all([
      Promise.resolve(normalizePhone(WHATSAPP_NUMBER)),
      fetchShopCategories()
    ]);
    return res.render('about', { whatsappNumber, categories });
  } catch (_error) {
    return res.status(500).send('Could not load about page.');
  }
});

app.get('/contact', async (req, res) => {
  try {
    const [whatsappNumber, categories] = await Promise.all([
      Promise.resolve(normalizePhone(WHATSAPP_NUMBER)),
      fetchShopCategories()
    ]);
    return res.render('contact', { whatsappNumber, categories });
  } catch (_error) {
    return res.status(500).send('Could not load contact page.');
  }
});

app.get('/health', (_req, res) => {
  return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/admin/login', (_req, res) => {
  return res.render('admin-login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (password !== ADMIN_PANEL_PASSWORD) {
    return res.status(401).render('admin-login', { error: 'Invalid password.' });
  }

  res.setHeader(
    'Set-Cookie',
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(ADMIN_SESSION_VALUE)}; Max-Age=${ADMIN_SESSION_TTL_SECONDS}; Path=/admin; HttpOnly; SameSite=Lax`
  );

  return res.redirect('/admin');
});

app.post('/admin/logout', requireAdminAuth, (_req, res) => {
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; Max-Age=0; Path=/admin; HttpOnly; SameSite=Lax`);
  return res.redirect('/admin/login');
});

app.get('/admin', requireAdminAuth, async (_req, res) => {
  try {
    return await renderAdminWithMessage(res, null, null);
  } catch (_error) {
    return res.status(500).send('Could not load admin dashboard.');
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { profile, cart, total } = req.body || {};
    const safeCart = Array.isArray(cart) ? cart : [];
    const parsedTotal = Number(total);

    if (!profile || !profile.firstName || !profile.lastName || !safeCart.length || Number.isNaN(parsedTotal) || parsedTotal <= 0) {
      return res.status(400).json({ error: 'Invalid order payload.' });
    }

    const customerName = `${(profile.firstName || '').trim()} ${(profile.lastName || '').trim()}`.trim();

    const insertResult = await pool.query(
      `INSERT INTO orders (
        customer_name,
        customer_email,
        customer_phone,
        customer_alt_phone,
        delivery_address,
        delivery_city,
        delivery_province,
        delivery_postal_code,
        items_json,
        items_total,
        status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING id`,
      [
        customerName,
        (profile.email || '').trim(),
        (profile.phone || '').trim(),
        (profile.altPhone || '').trim(),
        (profile.address || '').trim(),
        (profile.city || '').trim(),
        (profile.province || '').trim(),
        (profile.postalCode || '').trim(),
        JSON.stringify(safeCart),
        parsedTotal,
        'Pending'
      ]
    );

    return res.status(201).json({ id: insertResult.rows[0].id });
  } catch (_error) {
    return res.status(500).json({ error: 'Failed to store order.' });
  }
});

app.post('/admin/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const nextStatus = (req.body.status || '').trim();

    if (!ORDER_STATUSES.includes(nextStatus)) {
      return await renderAdminWithMessage(res, 'Invalid order status.', null);
    }

    const updateResult = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id',
      [nextStatus, id]
    );

    if (!updateResult.rows.length) {
      return await renderAdminWithMessage(res, 'Order not found.', null);
    }

    return await renderAdminWithMessage(res, null, 'Order status updated.');
  } catch (_error) {
    return await renderAdminWithMessage(res, 'Failed to update order status.', null);
  }
});

app.post('/admin/categories', requireAdminAuth, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      return await renderAdminWithMessage(res, 'Category name is required.', null);
    }

    await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
    return await renderAdminWithMessage(res, null, 'Category saved.');
  } catch (_error) {
    return await renderAdminWithMessage(res, 'Failed to save category.', null);
  }
});

app.post('/admin/categories/:id/delete', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const categoryResult = await pool.query('SELECT id, name FROM categories WHERE id = $1', [id]);
    if (!categoryResult.rows.length) {
      return await renderAdminWithMessage(res, 'Category not found.', null);
    }

    const categoryName = categoryResult.rows[0].name;
    const usageResult = await pool.query('SELECT COUNT(*)::INT AS count FROM products WHERE gender = $1', [categoryName]);

    if (usageResult.rows[0].count > 0) {
      return await renderAdminWithMessage(res, 'Cannot remove category that is still used by products.', null);
    }

    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return await renderAdminWithMessage(res, null, 'Category removed.');
  } catch (_error) {
    return await renderAdminWithMessage(res, 'Failed to remove category.', null);
  }
});

app.post('/admin/products', requireAdminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      options,
      category,
      customCategory,
      inStock
    } = req.body;

    const resolvedCategory = resolveCategory(category, customCategory);
    if (!name || !price || !options || !resolvedCategory) {
      return await renderAdminWithMessage(res, 'Name, price, options, and category are required.', null);
    }

    const parsedOptions = parseOptions(options);
    if (!parsedOptions.length) {
      return await renderAdminWithMessage(res, 'Provide at least one option.', null);
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return await renderAdminWithMessage(res, 'Price must be a valid number greater than zero.', null);
    }

    const files = (req.files || []).slice(0, 5);
    const uploadedImages = await Promise.all(files.map((file) => uploadImageToCloudinary(file)));
    const primaryImage = uploadedImages[0] || { imagePath: null, imagePublicId: null };

    const insertResult = await pool.query(
      `INSERT INTO products (name, description, price, sizes, gender, image_path, image_public_id, in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        name.trim(),
        (description || '').trim(),
        parsedPrice,
        parsedOptions.join(', '),
        resolvedCategory,
        primaryImage.imagePath,
        primaryImage.imagePublicId,
        Boolean(inStock)
      ]
    );

    const productId = insertResult.rows[0].id;

    for (let index = 0; index < uploadedImages.length; index += 1) {
      const image = uploadedImages[index];
      await pool.query(
        `INSERT INTO product_images (product_id, image_path, image_public_id, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [productId, image.imagePath, image.imagePublicId, index + 1]
      );
    }

    await ensureCategoryExists(resolvedCategory);
    return await renderAdminWithMessage(res, null, 'Product added successfully.');
  } catch (_error) {
    console.error('Error creating product:', _error);
    return await renderAdminWithMessage(res, `Error: ${_error.message || 'Failed to save product.'}`, null);
  }
});

app.post('/admin/products/:id/update', requireAdminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      options,
      category,
      customCategory,
      inStock
    } = req.body;
    const { id } = req.params;

    const resolvedCategory = resolveCategory(category, customCategory);
    if (!name || !price || !options || !resolvedCategory) {
      return await renderAdminWithMessage(res, 'Name, price, options, and category are required.', null);
    }

    const parsedOptions = parseOptions(options);
    if (!parsedOptions.length) {
      return await renderAdminWithMessage(res, 'Provide at least one option.', null);
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return await renderAdminWithMessage(res, 'Price must be a valid number greater than zero.', null);
    }

    const existingResult = await pool.query(
      'SELECT image_path, image_public_id FROM products WHERE id = $1',
      [id]
    );

    if (!existingResult.rows.length) {
      return await renderAdminWithMessage(res, 'Product not found.', null);
    }

    const files = (req.files || []).slice(0, 5);
    let nextImagePath = existingResult.rows[0].image_path;
    let nextImagePublicId = existingResult.rows[0].image_public_id;

    if (files.length) {
      const oldGalleryResult = await pool.query(
        'SELECT image_public_id FROM product_images WHERE product_id = $1',
        [id]
      );

      const oldIds = [
        existingResult.rows[0].image_public_id,
        ...oldGalleryResult.rows.map((row) => row.image_public_id)
      ].filter(Boolean);

      const uniqueOldIds = [...new Set(oldIds)];
      for (const publicId of uniqueOldIds) {
        await deleteCloudinaryImage(publicId);
      }

      await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);

      const uploadedImages = await Promise.all(files.map((file) => uploadImageToCloudinary(file)));
      nextImagePath = uploadedImages[0].imagePath;
      nextImagePublicId = uploadedImages[0].imagePublicId;

      for (let index = 0; index < uploadedImages.length; index += 1) {
        const image = uploadedImages[index];
        await pool.query(
          `INSERT INTO product_images (product_id, image_path, image_public_id, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [id, image.imagePath, image.imagePublicId, index + 1]
        );
      }
    }

    await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, sizes = $4, gender = $5, image_path = $6, image_public_id = $7, in_stock = $8
       WHERE id = $9`,
      [
        name.trim(),
        (description || '').trim(),
        parsedPrice,
        parsedOptions.join(', '),
        resolvedCategory,
        nextImagePath,
        nextImagePublicId,
        Boolean(inStock),
        id
      ]
    );

    await ensureCategoryExists(resolvedCategory);
    return await renderAdminWithMessage(res, null, 'Product updated successfully.');
  } catch (_error) {
    console.error('Error updating product:', _error);
    return await renderAdminWithMessage(res, 'Failed to update product.', null);
  }
});

app.post('/admin/products/:id/delete', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const galleryResult = await pool.query(
      'SELECT image_public_id FROM product_images WHERE product_id = $1',
      [id]
    );

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING image_public_id',
      [id]
    );

    if (!result.rows.length) {
      return await renderAdminWithMessage(res, 'Product not found.', null);
    }

    const allPublicIds = [
      result.rows[0].image_public_id,
      ...galleryResult.rows.map((row) => row.image_public_id)
    ].filter(Boolean);

    const uniquePublicIds = [...new Set(allPublicIds)];
    for (const publicId of uniquePublicIds) {
      await deleteCloudinaryImage(publicId);
    }

    return await renderAdminWithMessage(res, null, 'Product deleted successfully.');
  } catch (_error) {
    return await renderAdminWithMessage(res, 'Failed to delete product.', null);
  }
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Store app running at http://localhost:${PORT}`);
      startKeepAlivePinger();
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database.');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('DATABASE_URL set:', Boolean(process.env.SUPABASE_DATABASE_URL));
    console.error('DATABASE_SSL:', process.env.DATABASE_SSL);
    process.exit(1);
  });
