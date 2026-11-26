// Icônes dessinées à la main, même trait partout (1.6).
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const IconBag = () => (
  <svg {...base}><path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);
export const IconClose = () => (
  <svg {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconArrow = () => (
  <svg {...base} width={18} height={18}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconMinus = () => (<svg {...base} width={18} height={18}><path d="M6 12h12" /></svg>);
export const IconPlus = () => (<svg {...base} width={18} height={18}><path d="M12 6v12M6 12h12" /></svg>);
export const IconCheck = () => (<svg {...base} width={18} height={18}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
/* Mousse : vagues superposées */
export const IconFoam = () => (
  <svg {...base}><path d="M3 9c3-2 6 2 9 0s6 2 9 0" /><path d="M3 14c3-2 6 2 9 0s6 2 9 0" /><path d="M3 19h18" /></svg>
);
/* Lavable : bassine et goutte */
export const IconWash = () => (
  <svg {...base}><path d="M3 8h18l-2 11a1.5 1.5 0 0 1-1.5 1.2h-11A1.5 1.5 0 0 1 5 19L3 8Z" /><path d="M7 12c1.5 1 3.5 1 5 0s3.5-1 5 0" /><path d="M8 4.5c1 .8 2 .8 3 0M13 4.5c1 .8 2 .8 3 0" /></svg>
);
/* Imperméable : goutte et bouclier */
export const IconDrop = () => (
  <svg {...base}><path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3Z" /><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2" /></svg>
);
/* Tailles : règle */
export const IconRuler = () => (
  <svg {...base}><rect x="2.5" y="8" width="19" height="8" rx="1.5" /><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4" /></svg>
);
export const IconChevron = () => (<svg {...base} width={20} height={20}><path d="m6 9 6 6 6-6" /></svg>);
