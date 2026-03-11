require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { Pool } = require('pg');
const { v2: cloudinary } = require('cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '27123456789';
const CATEGORY_OPTIONS = ['Mens clothing', 'Womens clothing', 'Shoes', 'Perfume', 'Accessories'];

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

const upload = multer({ storage: multer.memoryStorage() });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('hide_out_of_stock', '0') ON CONFLICT (key) DO NOTHING`
  );
}

async function fetchProducts() {
  const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows.map(toViewProduct);
}

async function getStorefrontSettings() {
  const result = await pool.query("SELECT value FROM settings WHERE key = 'hide_out_of_stock'");
  return {
    hideOutOfStock: result.rows[0] ? result.rows[0].value === '1' : false
  };
}

async function uploadImageToCloudinary(file) {
  if (!file) {
    return { imagePath: null, imagePublicId: null };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'carmen-boutique' },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          imagePath: result.secure_url,
          imagePublicId: result.public_id
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

async function renderAdminWithMessage(res, error, success) {
  const [products, storefrontSettings] = await Promise.all([
    fetchProducts(),
    getStorefrontSettings()
  ]);

  return res.render('admin', {
    products,
    categoryOptions: CATEGORY_OPTIONS,
    storefrontSettings,
    error,
    success
  });
}

app.get('/', async (req, res) => {
  try {
    const storefrontSettings = await getStorefrontSettings();
    const selectedCategory = (req.query.category || 'All').trim();
    const hasFilter = selectedCategory && selectedCategory !== 'All';

    let sql = 'SELECT * FROM products';
    const params = [];

    if (hasFilter) {
      params.push(selectedCategory);
      sql += ` WHERE gender = $${params.length}`;
    }

    if (storefrontSettings.hideOutOfStock) {
      sql += hasFilter ? ' AND in_stock = TRUE' : ' WHERE in_stock = TRUE';
    }

    sql += ' ORDER BY created_at DESC';

    const productResult = await pool.query(sql, params);
    const categoryResult = await pool.query(
      "SELECT DISTINCT gender FROM products WHERE gender IS NOT NULL AND TRIM(gender) <> '' ORDER BY gender ASC"
    );

    const products = productResult.rows.map(toViewProduct);
    const categories = ['All', ...categoryResult.rows.map((row) => row.gender)];
    const safeSelectedCategory = categories.includes(selectedCategory) ? selectedCategory : 'All';

    return res.render('index', {
      products,
      categories,
      selectedCategory: safeSelectedCategory,
      storefrontSettings,
      whatsappNumber: normalizePhone(WHATSAPP_NUMBER)
    });
  } catch (_error) {
    return res.status(500).send('Could not load products.');
  }
});

app.get('/admin', async (_req, res) => {
  try {
    return await renderAdminWithMessage(res, null, null);
  } catch (_error) {
    return res.status(500).send('Could not load admin dashboard.');
  }
});

app.post('/admin/products', upload.single('image'), async (req, res) => {
  try {
    const {
      adminPassword,
      name,
      description,
      price,
      options,
      category,
      customCategory,
      inStock
    } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return await renderAdminWithMessage(res, 'Invalid admin password.', null);
    }

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

    const { imagePath, imagePublicId } = await uploadImageToCloudinary(req.file);

    await pool.query(
      `INSERT INTO products (name, description, price, sizes, gender, image_path, image_public_id, in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        name.trim(),
        (description || '').trim(),
        parsedPrice,
        parsedOptions.join(', '),
        resolvedCategory,
        imagePath,
        imagePublicId,
        Boolean(inStock)
      ]
    );

    return await renderAdminWithMessage(res, null, 'Product added successfully.');
  } catch (_error) {
    return res.status(500).send('Failed to save product.');
  }
});

app.post('/admin/products/:id/update', upload.single('image'), async (req, res) => {
  try {
    const {
      adminPassword,
      name,
      description,
      price,
      options,
      category,
      customCategory,
      inStock
    } = req.body;
    const { id } = req.params;

    if (adminPassword !== ADMIN_PASSWORD) {
      return await renderAdminWithMessage(res, 'Invalid admin password.', null);
    }

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

    const existing = existingResult.rows[0];
    let nextImagePath = existing.image_path;
    let nextImagePublicId = existing.image_public_id;

    if (req.file) {
      const uploadResult = await uploadImageToCloudinary(req.file);
      nextImagePath = uploadResult.imagePath;
      nextImagePublicId = uploadResult.imagePublicId;
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

    if (req.file && existing.image_public_id) {
      await deleteCloudinaryImage(existing.image_public_id);
    }

    return await renderAdminWithMessage(res, null, 'Product updated successfully.');
  } catch (_error) {
    return res.status(500).send('Failed to update product.');
  }
});

app.post('/admin/products/:id/delete', async (req, res) => {
  try {
    const { adminPassword } = req.body;
    const { id } = req.params;

    if (adminPassword !== ADMIN_PASSWORD) {
      return await renderAdminWithMessage(res, 'Invalid admin password.', null);
    }

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING image_public_id',
      [id]
    );

    if (!result.rows.length) {
      return await renderAdminWithMessage(res, 'Product not found.', null);
    }

    await deleteCloudinaryImage(result.rows[0].image_public_id);
    return await renderAdminWithMessage(res, null, 'Product deleted successfully.');
  } catch (_error) {
    return res.status(500).send('Failed to delete product.');
  }
});

app.post('/admin/settings/storefront', async (req, res) => {
  try {
    const { adminPassword, hideOutOfStock } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return await renderAdminWithMessage(res, 'Invalid admin password.', null);
    }

    await pool.query(
      "UPDATE settings SET value = $1 WHERE key = 'hide_out_of_stock'",
      [hideOutOfStock ? '1' : '0']
    );

    return await renderAdminWithMessage(res, null, 'Storefront settings updated.');
  } catch (_error) {
    return res.status(500).send('Failed to update storefront settings.');
  }
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Store app running at http://localhost:${PORT}`);
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
