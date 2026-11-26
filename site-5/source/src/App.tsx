import { useEffect } from 'react';
import { CartProvider } from './cart';
import { useRoute } from './router';
import SmoothScroll from './SmoothScroll';
import { Header, Tiroir, Footer } from './ui/Chrome';
import Accueil from './pages/Accueil';
import Collection from './pages/Collection';
import Produit from './pages/Produit';
import PagePanier from './pages/Panier';
import Aide from './pages/Aide';
import { trouve, RAYONS } from './data';

export default function App() {
  const route = useRoute();
  useEffect(() => {
    if (route.page !== 'aide' || !route.section) window.scrollTo(0, 0);
    const p = route.page === 'produit' ? trouve(route.id) : undefined;
    const r = route.page === 'collection' ? RAYONS.find((x) => x.id === route.rayon) : undefined;
    document.title = p ? `${p.nom} · Truffe` : r ? `${r.label} · Truffe` : route.page === 'collection' ? 'La boutique · Truffe' : route.page === 'panier' ? 'Ton panier · Truffe' : route.page === 'aide' ? 'Aide · Truffe' : 'Truffe · Boutique pour chiens';
  }, [route]);
  const cle = route.page === 'produit' ? `p-${route.id}` : route.page === 'collection' ? `c-${route.rayon ?? ''}-${route.q ?? ''}` : route.page;
  return (
    <CartProvider>
      <SmoothScroll>
        <Header route={route} />
        <main id="contenu" key={cle} className="min-h-[60svh]">
          {route.page === 'accueil' && <Accueil />}
          {route.page === 'collection' && <Collection rayon={route.rayon} q={route.q} />}
          {route.page === 'produit' && <Produit id={route.id} />}
          {route.page === 'panier' && <PagePanier />}
          {route.page === 'aide' && <Aide section={route.section} />}
        </main>
        <Footer />
        <Tiroir />
      </SmoothScroll>
    </CartProvider>
  );
}
