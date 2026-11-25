import { lazy, Suspense, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from './SmoothScroll';
import { CartProvider } from './shop/cart';
import { CartDrawer, Footer, Header } from './ui/Chrome';
import { useRoute, type Route } from './router';
import { StrataTransition, useScrollMotion } from './motion';
import { ThemeProvider } from './theme';
import BackgroundPaths from './components/kokonutui/BackgroundPaths';

const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const LayersPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.LayersPage })));
const SizesPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.SizesPage })));
const CartPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.CartPage })));

const TITLES: Record<Route, string> = {
  accueil: 'Lové · Paniers orthopédiques pour chien',
  produit: 'Le panier Lové · Mémoire de forme · Lové',
  couches: 'Les couches du panier · Lové',
  tailles: 'Guide des tailles · Lové',
  panier: 'Ton panier · Lové',
};

function ScrollReset({ route }: { route: Route }) {
  const lenis = useLenis();
  useEffect(() => {
    document.title = TITLES[route];
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [route, lenis]);
  return null;
}

function Motion({ route }: { route: Route }) {
  useScrollMotion(route);
  return null;
}

export default function App() {
  const { route, query } = useRoute();
  return (
    <ThemeProvider>
    <CartProvider>
      <BackgroundPaths className="fixed inset-0 -z-10" count={42} speed={0.6} angle={-10}>{null}</BackgroundPaths>
      <SmoothScroll>
        <ScrollReset route={route} />
        <button type="button" onClick={() => document.getElementById('contenu')?.focus()} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-lichen focus:px-4 focus:py-2 focus:text-sur-lichen">Aller au contenu</button>
        <Header route={route} />
        <main id="contenu" tabIndex={-1} className="outline-none">
          <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
            {route === 'accueil' && <Home />}
            {route === 'produit' && <Product initialSize={query.get('taille')} />}
            {route === 'couches' && <LayersPage />}
            {route === 'tailles' && <SizesPage />}
            {route === 'panier' && <CartPage />}
            <Motion route={route} />
          </Suspense>
        </main>
        <Footer />
        <CartDrawer />
        <StrataTransition route={route} />
      </SmoothScroll>
    </CartProvider>
    </ThemeProvider>
  );
}
