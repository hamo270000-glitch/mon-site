import { useEffect, useState } from 'react';

// Navigation par « # » : fonctionne sur GitHub Pages sans réglage serveur.
export type Route =
  | { page: 'accueil' }
  | { page: 'collection'; rayon?: string; q?: string }
  | { page: 'produit'; id: string }
  | { page: 'panier' }
  | { page: 'aide'; section?: string };

export function lire(hash = window.location.hash): Route {
  const [, a, b] = hash.replace(/^#/, '').split('/');
  const val = b ? decodeURIComponent(b) : undefined;
  if (a === 'collection') return { page: 'collection', rayon: val };
  if (a === 'recherche') return { page: 'collection', q: val };
  if (a === 'produit' && val) return { page: 'produit', id: val };
  if (a === 'panier') return { page: 'panier' };
  if (a === 'aide') return { page: 'aide', section: val };
  return { page: 'accueil' };
}

export const lien = {
  accueil: '#/',
  collection: (rayon?: string) => (rayon ? `#/collection/${rayon}` : '#/collection'),
  recherche: (q: string) => `#/recherche/${encodeURIComponent(q)}`,
  produit: (id: string) => `#/produit/${id}`,
  panier: '#/panier',
  aide: (section?: string) => (section ? `#/aide/${section}` : '#/aide'),
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
