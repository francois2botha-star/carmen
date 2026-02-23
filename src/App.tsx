import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Routes from './routes';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
