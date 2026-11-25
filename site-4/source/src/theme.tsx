import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { COLORS, type Color, type ColorId } from './data/catalog';

// Le coloris choisi pilote l'ambiance de tout le site (clair ou foncé, lumière, lignes du fond).
const KEY = 'love-coloris';

interface ThemeCtx { color: Color; setColor: (id: ColorId) => void }
const Ctx = createContext<ThemeCtx | null>(null);

function initial(): ColorId {
  try {
    const v = localStorage.getItem(KEY);
    if (v && COLORS.some((c) => c.id === v)) return v as ColorId;
  } catch { /* stockage indisponible */ }
  return 'beige';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ColorId>(initial);
  const color = COLORS.find((c) => c.id === id)!;

  useEffect(() => {
    const t = color.theme;
    const r = document.documentElement;
    const vars: Record<string, string> = {
      '--t-bg': t.bg, '--t-bg2': t.bg2, '--t-text': t.text, '--t-muted': t.muted, '--t-accent': t.accent,
      '--t-accent-2': t.accent2, '--t-on-accent': t.onAccent, '--glow': t.glow, '--t-lines': t.lines,
    };
    for (const [k, v] of Object.entries(vars)) r.style.setProperty(k, v);
    r.style.colorScheme = t.dark ? 'dark' : 'light';
    r.dataset.ambiance = t.dark ? 'foncee' : 'claire';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.bg);
    try { localStorage.setItem(KEY, id); } catch { /* stockage indisponible */ }
  }, [color, id]);

  const value = useMemo(() => ({ color, setColor: setId }), [color]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme doit être dans ThemeProvider');
  return c;
}
