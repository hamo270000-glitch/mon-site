// Icônes SVG (style Lucide), jamais d'emoji.
const P = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
export const IconSac = () => <svg {...P}><path d="M6 7h12l1 13H5L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>;
export const IconCheck = () => <svg {...P} strokeWidth={2.6}><path d="m5 12 5 5 9-10" /></svg>;
export const IconFleche = () => <svg {...P}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IconMenu = () => <svg {...P}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const IconFermer = () => <svg {...P}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconPlus = () => <svg {...P}><path d="M12 5v14M5 12h14" /></svg>;
export const IconMoins = () => <svg {...P}><path d="M5 12h14" /></svg>;
export const IconCamion = () => <svg {...P}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
export const IconRetour = () => <svg {...P}><path d="M9 14 4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg>;
export const IconLavage = () => <svg {...P}><path d="M3 7h18l-2 12H5L3 7Z" /><path d="M7 12c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0" /></svg>;
export const IconCoeur = () => <svg {...P}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>;
export const IconPatte = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <ellipse cx="7" cy="9" rx="2.2" ry="2.8" /><ellipse cx="12" cy="6.5" rx="2.2" ry="2.8" /><ellipse cx="17" cy="9" rx="2.2" ry="2.8" />
    <path d="M12 11c3.4 0 6 3.6 6 6.2 0 2-1.8 2.8-3.4 2.3-1-.3-1.7-.5-2.6-.5s-1.6.2-2.6.5C7.8 20 6 19.2 6 17.2 6 14.6 8.6 11 12 11Z" />
  </svg>
);
export const IconPhoto = () => <svg {...P} width={26} height={26} strokeWidth={1.6}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-8 8" /></svg>;
export const IconLoupe = () => <svg {...P}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
export const IconCadenas = () => <svg {...P}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
export const IconBulle = () => <svg {...P}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></svg>;
export const IconChevron = () => <svg {...P}><path d="m6 9 6 6 6-6" /></svg>;
export const IconGauche = () => <svg {...P}><path d="m15 6-6 6 6 6" /></svg>;
export const IconDroite = () => <svg {...P}><path d="m9 6 6 6-6 6" /></svg>;
export const IconFiltre = () => <svg {...P}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
