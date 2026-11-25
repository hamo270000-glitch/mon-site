import { lazy, Suspense, useEffect } from 'react';
import { useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SmoothScroll from './SmoothScroll';
import { CartProvider } from './shop/cart';
import { CartDrawer, Footer, Header } from './ui/Chrome';
import Sky from './ui/Sky';
import { useRoute, type Route } from './router';
import { NightfallTransition, useScrollMotion } from './motion';
import { CoverProvider } from './theme';

const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const PressurePage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.PressurePage })));
const SizesPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.SizesPage })));
const CartPage = lazy(() => import('./pages/Pages').then((m) => ({ default: m.CartPage })));

const TITLES: Record<Route, string> = {
  accueil: 'Museau Gris · Paniers orthopédiques pour chien âgé',
  produit: 'Le Doyen, panier orthopédique pour chien âgé · Museau Gris',
  appuis: 'Arthrose et points d’appui · Museau Gris',
  tailles: 'Guide des tailles · Museau Gris',
  panier: 'Ton panier · Museau Gris',
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
    <CoverProvider>
    <CartProvider>
      <Sky />
      <SmoothScroll>
        <ScrollReset route={route} />
        <button type="button" onClick={() => document.getElementById('contenu')?.focus()} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ambre focus:px-4 focus:py-2 focus:text-sur-ambre">Aller au contenu</button>
        <Header route={route} />
        <main id="contenu" tabIndex={-1} className="outline-none">
          <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
            {route === 'accueil' && <Home />}
            {route === 'produit' && <Product initialSize={query.get('taille')} withDog={query.get('chien') === '1'} />}
            {route === 'appuis' && <PressurePage />}
            {route === 'tailles' && <SizesPage />}
            {route === 'panier' && <CartPage />}
            <Motion route={route} />
          </Suspense>
        </main>
        <Footer />
        <CartDrawer />
        <NightfallTransition route={route} />
      </SmoothScroll>
    </CartProvider>
    </CoverProvider>
  );
}
