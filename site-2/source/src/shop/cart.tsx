import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { PRODUCTS, type Product } from '../data/products';

// Panier gardé sur le téléphone (localStorage). Aucun paiement n'est fait pour l'instant.
type Lines = Record<string, number>;
const KEY = 'rosee-panier';

function load(): Lines {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

interface Cart {
  lines: { product: Product; qty: number }[];
  count: number;
  total: number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Lines>(load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* stockage indisponible */ }
  }, [items]);

  const value = useMemo<Cart>(() => {
    const lines = PRODUCTS.filter((p) => items[p.id] > 0).map((p) => ({ product: p, qty: items[p.id] }));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.product.price, 0),
      add: (id) => setItems((s) => ({ ...s, [id]: (s[id] || 0) + 1 })),
      setQty: (id, qty) => setItems((s) => ({ ...s, [id]: Math.max(0, Math.min(9, qty)) })),
      open,
      setOpen,
    };
  }, [items, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart doit être dans CartProvider');
  return c;
}
