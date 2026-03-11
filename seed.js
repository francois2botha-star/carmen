require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'postgres',
  ssl: { rejectUnauthorized: false }
});

const products = [
  {
    name: 'Floral Wrap Midi Dress',
    description: 'Effortlessly elegant wrap dress in a vibrant floral print. Flattering on every shape — perfect for brunches, events, or a romantic evening out.',
    price: 450,
    sizes: 'XS, S, M, L, XL',
    gender: 'Womens clothing',
    image_path: 'https://picsum.photos/seed/carmen-wrap-dress/600/700'
  },
  {
    name: 'Wide Leg Linen Trousers',
    description: 'Breathable, relaxed-fit linen trousers that keep you cool and stylish all day long. A modern classic.',
    price: 380,
    sizes: 'XS, S, M, L, XL',
    gender: 'Womens clothing',
    image_path: 'https://picsum.photos/seed/carmen-linen-pants/600/700'
  },
  {
    name: 'Ruffle Off-Shoulder Top',
    description: 'Sweet and feminine off-shoulder top with delicate cascade ruffle detailing. Pairs beautifully with jeans, a skirt, or wide-leg trousers.',
    price: 245,
    sizes: 'S, M, L',
    gender: 'Womens clothing',
    image_path: 'https://picsum.photos/seed/carmen-ruffle-top/600/700'
  },
  {
    name: 'Satin Midi Slip Skirt',
    description: 'Luxuriously smooth satin slip skirt with a flattering bias cut. Effortlessly transitions from day to night.',
    price: 325,
    sizes: 'XS, S, M, L',
    gender: 'Womens clothing',
    image_path: 'https://picsum.photos/seed/carmen-slip-skirt/600/700'
  },
  {
    name: 'Embroidered Boho Kaftan',
    description: 'Hand-embroidered kaftan with intricate floral detailing. A true statement piece that speaks to free-spirited elegance.',
    price: 595,
    sizes: 'S/M, L/XL',
    gender: 'Womens clothing',
    image_path: 'https://picsum.photos/seed/carmen-kaftan/600/700'
  },
  {
    name: 'Slim Fit Tailored Blazer',
    description: 'Sharp, modern blazer cut for a clean silhouette. Elevates any outfit — office power look or smart-casual evening.',
    price: 680,
    sizes: 'S, M, L, XL, XXL',
    gender: 'Mens clothing',
    image_path: 'https://picsum.photos/seed/carmen-mens-blazer/600/700'
  },
  {
    name: 'Classic White Oxford Shirt',
    description: 'Timeless crisp white oxford shirt in premium cotton. The wardrobe essential every man needs in his rotation.',
    price: 290,
    sizes: 'S, M, L, XL',
    gender: 'Mens clothing',
    image_path: 'https://picsum.photos/seed/carmen-oxford-shirt/600/700'
  },
  {
    name: 'Slim Fit Navy Chinos',
    description: 'Smart-casual slim fit chinos in deep navy. Versatile enough for the boardroom or a weekend braai.',
    price: 420,
    sizes: '30, 32, 34, 36, 38',
    gender: 'Mens clothing',
    image_path: 'https://picsum.photos/seed/carmen-navy-chinos/600/700'
  },
  {
    name: 'Block Heel Strappy Sandals',
    description: 'Chic block heel sandals with delicate ankle straps. Comfortable enough for all-day wear, glam enough for a night out.',
    price: 550,
    sizes: '4, 5, 6, 7, 8',
    gender: 'Shoes',
    image_path: 'https://picsum.photos/seed/carmen-block-heels/600/700'
  },
  {
    name: 'Pointed Toe Heeled Mules',
    description: 'Sophisticated pointed mules with a mid-height stiletto heel. The perfect finishing touch to any polished look.',
    price: 625,
    sizes: '4, 5, 6, 7, 8',
    gender: 'Shoes',
    image_path: 'https://picsum.photos/seed/carmen-pointed-mules/600/700'
  },
  {
    name: 'White Leather Platform Sneakers',
    description: 'Trendy platform sneakers in crisp white leather with gold eyelets. Elevate your casual look effortlessly.',
    price: 480,
    sizes: '4, 5, 6, 7, 8, 9',
    gender: 'Shoes',
    image_path: 'https://picsum.photos/seed/carmen-platform-sneakers/600/700'
  },
  {
    name: 'Crystal Embellished Ballet Flats',
    description: 'Pretty ballet flats adorned with scattered crystal embellishments. Comfortable meets completely glamorous.',
    price: 395,
    sizes: '4, 5, 6, 7, 8',
    gender: 'Shoes',
    image_path: 'https://picsum.photos/seed/carmen-ballet-flats/600/700'
  },
  {
    name: 'Rose Oud Eau de Parfum',
    description: 'A rich and intoxicating blend of Bulgarian rose and deep oud wood. Long-lasting, intensely feminine, utterly unforgettable.',
    price: 899,
    sizes: '50ml, 100ml',
    gender: 'Perfume',
    image_path: 'https://picsum.photos/seed/carmen-rose-oud/600/700'
  },
  {
    name: 'Black Amber Night',
    description: 'Deep and mysterious fragrance with notes of black amber, dark musk, and warm vanilla. Bold, seductive, and sophisticated.',
    price: 750,
    sizes: '30ml, 50ml, 100ml',
    gender: 'Perfume',
    image_path: 'https://picsum.photos/seed/carmen-black-amber/600/700'
  },
  {
    name: 'Jasmine & Vanilla Bloom',
    description: 'Fresh and floral with a warm creamy vanilla base. Light enough for everyday, special enough for every moment.',
    price: 680,
    sizes: '50ml, 100ml',
    gender: 'Perfume',
    image_path: 'https://picsum.photos/seed/carmen-jasmine-vanilla/600/700'
  },
  {
    name: 'Ocean Breeze Body Mist',
    description: 'Light, refreshing mist with notes of sea salt, white musk, and sun-dried driftwood. Your daily dose of freshness.',
    price: 290,
    sizes: '150ml, 250ml',
    gender: 'Perfume',
    image_path: 'https://picsum.photos/seed/carmen-ocean-mist/600/700'
  },
  {
    name: 'Gold Layered Chain Necklace',
    description: 'Delicate multi-strand gold chain necklace that adds instant glamour to any neckline. Lightweight and hypoallergenic.',
    price: 250,
    sizes: 'One size',
    gender: 'Accessories',
    image_path: 'https://picsum.photos/seed/carmen-gold-necklace/600/700'
  },
  {
    name: 'Silk Leopard Print Scarf',
    description: 'Versatile 100% silk scarf in a timeless leopard print. Wear as a neck scarf, hair wrap, bag charm, or belt.',
    price: 195,
    sizes: 'One size',
    gender: 'Accessories',
    image_path: 'https://picsum.photos/seed/carmen-leopard-scarf/600/700'
  },
  {
    name: 'Mini Leather Crossbody Bag',
    description: 'Compact yet roomy mini bag in premium faux leather. Gold hardware, adjustable strap, and multiple interior pockets.',
    price: 850,
    sizes: 'One size',
    gender: 'Accessories',
    image_path: 'https://picsum.photos/seed/carmen-crossbody-bag/600/700'
  },
  {
    name: 'Crystal Drop Earrings',
    description: 'Stunning chandelier drop earrings with cascading crystal stones that catch the light beautifully. The perfect finishing touch.',
    price: 175,
    sizes: 'One size',
    gender: 'Accessories',
    image_path: 'https://picsum.photos/seed/carmen-crystal-earrings/600/700'
  }
];

async function seed() {
  try {
    const check = await pool.query('SELECT COUNT(*) FROM products');
    const count = parseInt(check.rows[0].count);

    if (count > 0) {
      console.log(`Database already has ${count} product(s). Skipping seed.`);
      console.log('To re-seed, delete all products from the admin panel first.');
      process.exit(0);
    }

    console.log('Seeding 20 products into Supabase...\n');

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, description, price, sizes, gender, image_path, in_stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [product.name, product.description, product.price, product.sizes, product.gender, product.image_path, true]
      );
      console.log(`  ✓ ${product.name}`);
    }

    console.log('\n✅ 20 products seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
