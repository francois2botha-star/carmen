import { describe, it, expect, vi, afterEach } from 'vitest';

// This test verifies the persist rehydration *race* behavior: when an in-memory
// cart exists before async rehydration completes, the persisted value must not
// overwrite it (our persist `merge` / onRehydrateStorage enforces this).

describe('cartStore persist rehydration (race)', () => {
  afterEach(() => {
    // reset module cache and cleanup any mock localStorage we created
    vi.resetModules();
    // @ts-ignore
    delete globalThis.localStorage;
  });

  it('prefers in-memory items when async rehydrate applies persisted state', async () => {
    // create a persisted payload (zustand persist stores { state: ..., version })
    const persistedItem = {
      product: { id: 'p-persist', name: 'Persisted', price: 5, weight_kg: 1, images: [], category: 'x', is_active: true },
      quantity: 2,
    };

    const stored = JSON.stringify({ state: { items: [persistedItem] }, version: 0 });

    // provide localStorage that returns the persisted payload
    // this must be available before importing the store so persist can read it
    // @ts-ignore
    globalThis.localStorage = {
      _store: new Map([['carmen-cart-storage', stored]]),
      getItem(key: string) {
        return this._store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        this._store.set(key, value);
      },
      removeItem(key: string) {
        this._store.delete(key);
      },
      clear() {
        this._store.clear();
      },
    } as any;

    // import the store fresh so persist will start its async rehydrate
    const mod = await import('./cartStore');
    const { useCartStore } = mod;

    // simulate a user action that adds an item *before* async rehydration completes
    const inMemoryItem = {
      product: { id: 'p-inmem', name: 'InMemory', price: 10, weight_kg: 2, images: [], category: 'x', is_active: true },
      quantity: 1,
    };

    // set in-memory state immediately
    useCartStore.setState({ items: [inMemoryItem] });

    // allow the async rehydrate callback to run (it runs in the background)
    await new Promise((r) => setTimeout(r, 20));

    // final store items must still reflect the in-memory item (persist must not overwrite)
    const items = useCartStore.getState().items;
    expect(items).toEqual([inMemoryItem]);
  });
});