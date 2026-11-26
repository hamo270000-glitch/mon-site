import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { trouve, type Produit, type Variante, type Coloris } from './data';

// Panier gardé sur le téléphone (localStorage). Le paiement n'est pas encore branché.
const KEY = 'truffe-panier';
interface Item { key: string; id: string; variante: string; coloris: string; qty: number }
const charge = (): Item[] => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };

export interface Ligne { key: string; produit: Produit; variante: Variante; coloris: Coloris; qty: number }
interface Cart {
  lignes: Ligne[];
  count: number;
  total: number;
  add: (id: string, variante: string, coloris: string, n?: number) => void;
  setQty: (key: string, qty: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  cible: RefObject<HTMLButtonElement | null>;
  secousse: number;
}
const Ctx = createContext<Cart | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>(charge);
  const [open, setOpen] = useState(false);
  const [secousse, setSecousse] = useState(0);
  const cible = useRef<HTMLButtonElement>(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* stockage indisponible */ } }, [items]);

  const value = useMemo<Cart>(() => {
    const lignes: Ligne[] = items.flatMap((it) => {
      const produit = trouve(it.id);
      const variante = produit?.variantes.find((v) => v.id === it.variante);
      const coloris = produit?.coloris.find((c) => c.id === it.coloris);
      return produit && variante && coloris && it.qty > 0 ? [{ key: it.key, produit, variante, coloris, qty: it.qty }] : [];
    });
    return {
      lignes,
      count: lignes.reduce((n, l) => n + l.qty, 0),
      total: lignes.reduce((n, l) => n + l.qty * l.variante.price, 0),
      add: (id, variante, coloris, n = 1) => {
        const key = `${id}·${variante}·${coloris}`;
        setItems((st) => (st.some((i) => i.key === key)
          ? st.map((i) => (i.key === key ? { ...i, qty: Math.min(9, i.qty + n) } : i))
          : [...st, { key, id, variante, coloris, qty: Math.min(9, n) }]));
        setSecousse((n) => n + 1);
      },
      setQty: (key, qty) => setItems((st) => st.map((i) => (i.key === key ? { ...i, qty: Math.max(0, Math.min(9, qty)) } : i)).filter((i) => i.qty > 0)),
      open, setOpen, cible, secousse,
    };
  }, [items, open, secousse]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart doit être dans CartProvider');
  return c;
}
