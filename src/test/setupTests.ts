// Minimal globals + DOM shims for Vitest
// - Ensures `localStorage` is available before any modules run
// - Provides common DOM shims used by components in tests

const createLocalStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  };
};

// Ensure a working localStorage is present on all globals used by tests
const ls = createLocalStorageMock();
// assign to globalThis and window (jsdom)
(globalThis as any).localStorage = ls;
if (typeof window !== 'undefined') (window as any).localStorage = ls;

// Provide a no-op matchMedia for components that use it
if (typeof (window as any).matchMedia !== 'function') {
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
