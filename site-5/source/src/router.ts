import { useEffect, useState } from 'react';

// Navigation par « # » : fonctionne sur GitHub Pages sans réglage serveur.
export type Route = { page: 'accueil' } | { page: 'boutique'; rayon?: string } | { page: 'produit'; id: string } | { page: 'panier' };

export function lire(hash = window.location.hash): Route {
  const [, a, b] = hash.replace(/^#/, '').split('/');
  if (a === 'boutique') return { page: 'boutique', rayon: b };
  if (a === 'produit' && b) return { page: 'produit', id: b };
  if (a === 'panier') return { page: 'panier' };
  return { page: 'accueil' };
}

export const lien = {
  accueil: '#/',
  boutique: (rayon?: string) => (rayon ? `#/boutique/${rayon}` : '#/boutique'),
  produit: (id: string) => `#/produit/${id}`,
  panier: '#/panier',
};

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => lire());
  useEffect(() => {
    const on = () => setRoute(lire());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
