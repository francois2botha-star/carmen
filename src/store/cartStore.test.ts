import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './cartStore';

// Provide a minimal localStorage mock for vitest environment
if (!globalThis.localStorage) {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  } as any;
}

describe('cartStore', () => {
  beforeEach(() => {
    // reset store
    useCartStore.setState({ items: [] });
  });

  it('adds an item to the cart', () => {
    const product = { id: 'p1', name: 'Test', price: 10, weight_kg: 1, images: [], category: 'test', is_active: true };
    useCartStore.getState().addItem(product as any, 2);
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
  });

  it('increments quantity when adding the same product', () => {
    const product = { id: 'p1', name: 'Test', price: 10, weight_kg: 1, images: [], category: 'test', is_active: true };
    useCartStore.getState().addItem(product as any, 1);
    useCartStore.getState().addItem(product as any, 3);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('removes an item', () => {
    const product = { id: 'p1', name: 'Test', price: 10, weight_kg: 1, images: [], category: 'test', is_active: true };
    useCartStore.getState().addItem(product as any, 1);
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('updates quantity', () => {
    const product = { id: 'p1', name: 'Test', price: 10, weight_kg: 1, images: [], category: 'test', is_active: true };
    useCartStore.getState().addItem(product as any, 1);
    useCartStore.getState().updateQuantity('p1', 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('calculates totals', () => {
    const p1 = { id: 'p1', name: 'A', price: 10, weight_kg: 1, images: [], category: 'test', is_active: true };
    const p2 = { id: 'p2', name: 'B', price: 5, weight_kg: 2, images: [], category: 'test', is_active: true };
    useCartStore.getState().addItem(p1 as any, 2);
    useCartStore.getState().addItem(p2 as any, 3);
    expect(useCartStore.getState().getTotalItems()).toBe(5);
    expect(useCartStore.getState().getTotalPrice()).toBe(2 * 10 + 3 * 5);
    expect(useCartStore.getState().getTotalWeight()).toBeCloseTo(2 * 1 + 3 * 2);
  });
});