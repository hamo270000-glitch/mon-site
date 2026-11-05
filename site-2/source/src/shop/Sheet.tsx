import { useEffect, useRef, type ReactNode } from 'react';
import { useLenis } from 'lenis/react';

// Panneau qui monte du bas (téléphone) ou glisse de la droite (ordinateur).
export default function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, lenis, onClose]);

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-plum/30 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-lenis-prevent
        inert={!open}
        className={`sheet absolute bottom-0 left-0 right-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-nacre px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 outline-none
          sm:bottom-0 sm:left-auto sm:top-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-[28px] sm:pt-6
          ${open ? 'is-open' : ''}`}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-plum/15 sm:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-porcelaine text-xl" aria-label="Fermer">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
