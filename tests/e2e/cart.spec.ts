import { test, expect } from '@playwright/test';

test('cart shows persisted items and header badge updates', async ({ page }) => {
  page.on('console', (msg) => console.log('PAGE LOG>', msg.text()));
  const items = [
    {
      product: {
        id: 'p-e2e',
        name: 'E2E Product',
        price: 9.99,
        weight_kg: 1,
        images: [],
        category: 'e2e',
        is_active: true,
      },
      quantity: 3,
    },
  ];

  // try storing as raw state (persist middleware may read this shape in the browser)
  await page.addInitScript((value) => {
    localStorage.setItem('carmen-cart-storage', value);
  }, JSON.stringify({ items }));

  // also store the wrapped shape (some persist versions read { state: ..., version })
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('carmen-cart-storage', value);
    } catch (e) {
      /* noop */
    }
  }, JSON.stringify({ state: { items }, version: 0 }));

  // navigate directly to the cart route (app uses basename "/carmen")
  await page.goto('http://localhost:4173/carmen/cart');

  // dump persisted value from localStorage for debugging (captured in Playwright output)
  const stored = await page.evaluate(() => localStorage.getItem('carmen-cart-storage'));
  console.log('persisted localStorage:', stored);

  // wait a bit longer for async rehydrate to apply
  await page.waitForTimeout(1500);

  // verify product appears and header badge shows quantity (allow generous timeout)
  await expect(page.locator('text=E2E Product'), { timeout: 8000 }).toBeVisible();
  await expect(page.locator('text=3'), { timeout: 8000 }).toBeVisible();
});