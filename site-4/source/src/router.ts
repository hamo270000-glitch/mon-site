import { useEffect, useState } from 'react';

// Navigation par « # » : marche sur GitHub Pages sans configuration.
export type Route = 'accueil' | 'produit' | 'couches' | 'tailles' | 'panier';

const PATHS: Record<string, Route> = {
  '': 'accueil',
  '/': 'accueil',
  '/panier-orthopedique': 'produit',
  '/les-couches': 'couches',
  '/guide-des-tailles': 'tailles',
  '/panier': 'panier',
};

export const href: Record<Route, string> = {
  accueil: '#/',
  produit: '#/panier-orthopedique',
  couches: '#/les-couches',
  tailles: '#/guide-des-tailles',
  panier: '#/panier',
};

function read(): { route: Route; query: URLSearchParams } {
  const raw = window.location.hash.replace(/^#/, '');
  const [path, qs = ''] = raw.split('?');
  return { route: PATHS[path] ?? 'accueil', query: new URLSearchParams(qs) };
}

export function useRoute() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const on = () => setState(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return state;
}
