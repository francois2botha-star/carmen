import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalWeight: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set: any, get: any) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item: CartItem) => item.product.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item: CartItem) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((item: CartItem) => item.product.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item: CartItem) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total: number, item: CartItem) => total + item.product.price * item.quantity,
          0
        );
      },

      getTotalWeight: () => {
        return get().items.reduce(
          (total: number, item: CartItem) => total + item.product.weight_kg * item.quantity,
          0
        );
      },
    }),
    {
      name: 'carmen-cart-storage',
    }
  )
);
