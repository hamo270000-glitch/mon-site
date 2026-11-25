import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { COLORS, type Color, type ColorId } from './data/catalog';

// Coloris de la housse choisi, partagé par toutes les scènes 3D et gardé sur le téléphone.
const KEY = 'museau-gris-coloris';

interface CoverCtx { color: Color; setColor: (id: ColorId) => void }
const Ctx = createContext<CoverCtx | null>(null);

function initial(): ColorId {
  try {
    const v = localStorage.getItem(KEY);
    if (v && COLORS.some((c) => c.id === v)) return v as ColorId;
  } catch { /* stockage indisponible */ }
  return 'argent';
}

export function CoverProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ColorId>(initial);
  const color = COLORS.find((c) => c.id === id)!;
  useEffect(() => { try { localStorage.setItem(KEY, id); } catch { /* stockage indisponible */ } }, [id]);
  const value = useMemo(() => ({ color, setColor: setId }), [color]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCover() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCover doit être dans CoverProvider');
  return c;
}
