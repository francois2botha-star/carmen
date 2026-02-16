import { test, expect } from '@playwright/test';

test('full checkout flow (from cart -> place order) with Supabase stubs', async ({ page }) => {
  // stub Supabase REST inserts so CI doesn't need real DB credentials
  await page.route('**/rest/v1/orders*', async (route) => {
    const now = new Date().toISOString();
    const fakeOrder = [
      {
        id: 'order-e2e-123',
        user_email: 'test@example.com',
        user_name: 'E2E Tester',
        user_phone: '+27123456789',
        subtotal: 99.9,
        shipping_cost: 60,
        total: 159.9,
        status: 'pending',
        created_at: now,
      },
    ];

    await route.fulfill({
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fakeOrder),
    });
  });

  await page.route('**/rest/v1/order_items*', async (route) => {
    await route.fulfill({ status: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify([]) });
  });

  // accept any alert dialogs (shipping fallback alerts, etc.)
  page.on('dialog', (d) => d.accept());

  // prepare a persisted cart so we don't depend on product fetch
  const items = [
    {
      product: {
        id: 'p-e2e',
        name: 'E2E Product',
        price: 49.95,
        weight_kg: 1,
        images: [],
        category: 'e2e',
        is_active: true,
      },
      quantity: 2,
    },
  ];

  await page.addInitScript((value) => {
    localStorage.setItem('carmen-cart-storage', value);
  }, JSON.stringify({ state: { items }, version: 0 }));

  // go directly to the cart, proceed to checkout and complete the order
  await page.goto('http://localhost:4173/carmen/cart');

  await expect(page.locator('text=E2E Product')).toBeVisible();
  await page.click('text=Proceed to Checkout');

  // fill shipping form
  await expect(page).toHaveURL(/\/carmen\/checkout/);
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="name"]', 'E2E Tester');
  await page.fill('input[name="phone"]', '+27123456789');
  await page.fill('input[name="address"]', '1 Test Lane');
  await page.fill('input[name="city"]', 'Cape Town');
  await page.selectOption('select[name="province"]', 'Western Cape');
  await page.fill('input[name="postalCode"]', '8001');

  // continue to review (shipping cost will be calculated — PUDO is mocked or fallback used)
  await page.click('text=Continue to Review');

  // Place order (Supabase insert requests are stubbed above)
  await page.click('text=Place Order');

  // verify success page shows the fake order id
  await page.waitForURL(/\/carmen\/checkout\/success\?orderId=/, { timeout: 5000 });
  await expect(page.locator('text=Thank you for your order!')).toBeVisible();
  await expect(page.locator('text=order-e2e-123')).toBeVisible();
});