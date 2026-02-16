import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );
          console.log('[cartStore] addItem:', product, quantity);
          if (existingItem) {
            const updated = {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
            console.log('[cartStore] updated items:', updated.items);
            return updated;
          }
          const newState = {
            items: [...state.items, { product, quantity }],
          };
          console.log('[cartStore] new items:', newState.items);
          return newState;
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      getTotalWeight: () => {
        return get().items.reduce(
          (sum, item) => sum + item.product.weight_kg * item.quantity,
          0
        );
      },
    }),
    {
      name: 'carmen-cart-storage',
      // use real localStorage in the browser, otherwise provide a no-op storage for tests/SSR
      storage:
        typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
          ? {
              getItem: (name: string) => window.localStorage.getItem(name),
              setItem: (name: string, value: string) => window.localStorage.setItem(name, value),
              removeItem: (name: string) => window.localStorage.removeItem(name),
            }
          : {
              getItem: (_: string) => null,
              setItem: (_: string, __: string) => undefined,
              removeItem: (_: string) => undefined,
            },
      // when merging persisted state, prefer the in-memory/current state if it already has items
      merge: (persistedState: any, currentState: any) => {
        const persistedItems = (persistedState && persistedState.items) || [];
        const currentItems = (currentState && currentState.items) || [];
        return {
          // other scalar fields: prefer currentState values
          ...persistedState,
          ...currentState,
          // for items, keep currentItems if non-empty (prevents rehydrate race), otherwise use persisted
          items: currentItems.length ? currentItems : persistedItems,
        };
      },
      // helpful debug hook during rehydration (keeps items merged)
      onRehydrateStorage: () => (state) => {
        try {
          if (!state) return;
          const items = state.items ?? [];
          // dedupe persisted items by product id
          const deduped: any[] = [];
          for (const it of items) {
            if (!deduped.some((d) => d.product.id === it.product.id)) deduped.push(it);
          }
          if (deduped.length !== items.length) {
            // mutate the rehydrated state (persist middleware will apply it)
            state.items = deduped;
          }
        } catch (err) {
          console.warn('[cartStore] rehydrate merge failed', err);
        }
      },
    }
  )
);
