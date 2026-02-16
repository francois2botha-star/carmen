// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// mock the cart store so components import a stable, test-friendly store
const mockedItems = [
  {
    product: { id: 'p1', name: 'UI Test Product', price: 12.5, weight_kg: 1, images: [], category: 'test', is_active: true },
    quantity: 2,
  },
];

vi.mock('@/store/cartStore', () => ({
  useCartStore: (selector?: any) => {
    const store = {
      items: mockedItems,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      getTotalItems: () => mockedItems.reduce((s, i) => s + i.quantity, 0),
      getSubtotal: () => mockedItems.reduce((s, i) => s + i.product.price * i.quantity, 0),
      getTotalWeight: () => mockedItems.reduce((s, i) => s + i.product.weight_kg * i.quantity, 0),
    };
    return typeof selector === 'function' ? selector(store) : store;
  },
}));

describe('Cart UI integration', () => {

  it('renders cart items and header badge updates', async () => {
    // import UI components after the store is initialized
    const { Header } = await import('@/components/Header');
    const { CartPage } = await import('./CartPage');

    const { render, screen } = await import('@testing-library/react');
    const { MemoryRouter } = await import('react-router-dom');

    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <Header />
        <CartPage />
      </MemoryRouter>
    );

    // page title
    expect(screen.getByText(/Shopping Cart/i)).toBeTruthy();

    // product is listed
    expect(screen.getByText('UI Test Product')).toBeTruthy();

    // quantity visible in cart (quantity + header badge both show `2`)
    const matches = screen.getAllByText('2');
    expect(matches.length).toBeGreaterThanOrEqual(2);

    // header badge should show total items = 2
    const header = screen.getByRole('banner');
    const { within } = await import('@testing-library/react');
    expect(within(header).getByText('2')).toBeTruthy();
  });
});