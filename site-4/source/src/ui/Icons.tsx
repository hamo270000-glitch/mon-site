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
export const IconPress = () => (
  <svg {...base}><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11" /><path d="M12 10.5V9a1.5 1.5 0 0 1 3 0v2" /><path d="M15 10.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.5L4 15a1.6 1.6 0 0 1 2.5-2L9 15" /></svg>
);
export const IconMenu = () => (
  <svg {...base}><path d="M4 8h16M4 16h16" /></svg>
);
