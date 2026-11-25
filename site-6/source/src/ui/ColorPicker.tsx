import { LayoutGroup, motion } from 'motion/react';
import { COLORS } from '../data/catalog';
import { useCover } from '../theme';

// Choix du coloris de la housse : l'anneau ambré glisse d'une pastille à l'autre.
export default function ColorPicker({ id, big = false }: { id: string; big?: boolean }) {
  const { color, setColor } = useCover();
  return (
    <LayoutGroup id={id}>
      <div className="flex flex-wrap gap-4" role="radiogroup" aria-label="Coloris de la housse">
        {COLORS.map((c) => {
          const on = c.id === color.id;
          return (
            <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => setColor(c.id)}
              className="relative flex cursor-pointer flex-col items-center gap-2 rounded-xl p-1.5">
              <span className="relative grid place-items-center">
                {on && (
                  <motion.span layoutId="anneau" className="absolute -inset-1.5 rounded-full border-2 border-ambre"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
                )}
                <span className={`block rounded-full border border-creme/20 ${big ? 'h-14 w-14' : 'h-11 w-11'}`}
                  style={{ background: `radial-gradient(circle at 35% 30%, ${c.cover}, ${c.bolster})` }} />
              </span>
              <span className={`text-[0.85rem] ${on ? 'font-semibold text-creme' : 'text-brume'}`}>{c.label}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
