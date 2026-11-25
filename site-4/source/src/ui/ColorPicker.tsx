import { LayoutGroup, motion } from 'motion/react';
import { COLORS } from '../data/catalog';
import { useTheme } from '../theme';

// Sélecteur de coloris : l'anneau glisse d'une pastille à l'autre (motion), et tout le site change d'ambiance.
export default function ColorPicker({ id, big = false }: { id: string; big?: boolean }) {
  const { color, setColor } = useTheme();
  return (
    <LayoutGroup id={id}>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Coloris">
        {COLORS.map((c) => {
          const on = c.id === color.id;
          return (
            <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => setColor(c.id)}
              className="relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-1.5 focus-visible:outline-2">
              <span className="relative grid place-items-center">
                {on && (
                  <motion.span layoutId="anneau" className="absolute -inset-1.5 rounded-full border-2 border-lichen"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className={`block rounded-full border border-texte/15 ${big ? 'h-14 w-14' : 'h-11 w-11'}`}
                  style={{ background: `radial-gradient(circle at 35% 30%, ${c.cover}, ${c.bolster})` }} />
              </span>
              <span className={`text-[0.85rem] ${on ? 'font-semibold text-texte' : 'text-doux'}`}>{c.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
