import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { COLORS, SIZES, type ColorId, type SizeId } from '../data/catalog';

// Panier gardé sur le téléphone (localStorage). Le paiement n'est pas encore branché.
type Lines = Record<string, number>; // clé "taille|coloris"
const KEY = 'museau-gris-panier';

function load(): Lines {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export interface CartLine { key: string; size: (typeof SIZES)[number]; color: (typeof COLORS)[number]; qty: number }

interface Cart {
  lines: CartLine[];
  count: number;
  total: number;
  add: (size: SizeId, color: ColorId) => void;
  setQty: (key: string, qty: number) => void;
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
    const lines: CartLine[] = [];
    for (const [key, qty] of Object.entries(items)) {
      if (qty <= 0) continue;
      const [s, c] = key.split('|');
      const size = SIZES.find((x) => x.id === s);
      const color = COLORS.find((x) => x.id === c);
      if (size && color) lines.push({ key, size, color, qty });
    }
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.size.price, 0),
      add: (size, color) => setItems((st) => ({ ...st, [`${size}|${color}`]: Math.min(9, (st[`${size}|${color}`] || 0) + 1) })),
      setQty: (key, qty) => setItems((st) => ({ ...st, [key]: Math.max(0, Math.min(9, qty)) })),
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
