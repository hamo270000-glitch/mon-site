import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SIZES, type Size, type SizeId } from './data';

// Panier gardé sur le téléphone (localStorage). Le paiement n'est pas encore branché.
const KEY = 'veilleuse-panier';
type Lines = Partial<Record<SizeId, number>>;
const load = (): Lines => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };

interface Cart {
  lines: { size: Size; qty: number }[];
  count: number;
  total: number;
  add: (id: SizeId) => void;
  setQty: (id: SizeId, qty: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}
const Ctx = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Lines>(load);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* stockage indisponible */ } }, [items]);
  const value = useMemo<Cart>(() => {
    const lines = SIZES.filter((s) => (items[s.id] ?? 0) > 0).map((s) => ({ size: s, qty: items[s.id]! }));
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.size.price, 0),
      add: (id) => setItems((st) => ({ ...st, [id]: Math.min(9, (st[id] ?? 0) + 1) })),
      setQty: (id, qty) => setItems((st) => ({ ...st, [id]: Math.max(0, Math.min(9, qty)) })),
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
