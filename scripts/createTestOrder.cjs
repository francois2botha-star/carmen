const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local manually
const envRaw = fs.readFileSync('.env.local', 'utf8');
const env = {};
envRaw.split(/\r?\n/).forEach((line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
});

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase env vars not found in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ user_email: 'auto@test.com', user_name: 'Auto Tester', user_phone: '+27123456789', subtotal: 100, shipping_cost: 20, total: 120, pudo_size: 'small', shipping_address: '123 Test St, Cape Town', status: 'pending' }])
      .select()
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert([{ order_id: order.id, product_id: '00000000-0000-0000-0000-000000000000', product_name: 'Auto-product', quantity: 1, price: 100 }]);

    if (itemsError) throw itemsError;

    console.log('Created test order:', order.id);
  } catch (err) {
    console.error('Failed to create test order:', err);
  }
})();