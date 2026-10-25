import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import MarketplaceApp from './MarketplaceApp.tsx';

const DemoApp = lazy(() => import('./App.tsx'));

createRoot(document.getElementById('root')!).render(
  location.pathname === '/demo'
    ? <Suspense fallback={<p>Cargando prototipo…</p>}><DemoApp /></Suspense>
    : <MarketplaceApp />,
);
