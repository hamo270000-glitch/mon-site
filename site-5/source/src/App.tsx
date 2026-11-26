import { useEffect } from 'react';
import { CartProvider } from './cart';
import { useRoute } from './router';
import SmoothScroll from './SmoothScroll';
import { Header, Tiroir, Footer } from './ui/Chrome';
import Accueil from './pages/Accueil';
import Boutique from './pages/Boutique';
import Produit from './pages/Produit';
import PagePanier from './pages/Panier';
import { trouve } from './data';

export default function App() {
  const route = useRoute();
  useEffect(() => {
    window.scrollTo(0, 0);
    const p = route.page === 'produit' ? trouve(route.id) : undefined;
    document.title = p ? `${p.nom} · Truffe` : route.page === 'boutique' ? 'La boutique · Truffe' : route.page === 'panier' ? 'Ton panier · Truffe' : 'Truffe · Boutique pour chiens';
  }, [route]);
  const cle = route.page === 'produit' ? `p-${route.id}` : route.page;
  return (
    <CartProvider>
      <SmoothScroll>
        <Header route={route} />
        <main id="contenu" key={cle}>
          {route.page === 'accueil' && <Accueil />}
          {route.page === 'boutique' && <Boutique rayon={route.rayon} />}
          {route.page === 'produit' && <Produit id={route.id} />}
          {route.page === 'panier' && <PagePanier />}
        </main>
        <Footer />
        <Tiroir />
      </SmoothScroll>
    </CartProvider>
  );
}
