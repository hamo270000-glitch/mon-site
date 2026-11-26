import { IconPhoto } from './Icons';

// Emplacement d'une photo produit, en attendant les vraies photos.
// Pour mettre une photo : passer `src` (ex. './photos/panier-nuage-1.jpg').
export default function Visuel({ teinte, vue, nom, src, petit = false, className = '' }: {
  teinte: string; vue?: string; nom?: string; src?: string; petit?: boolean; className?: string;
}) {
  if (src) return <img src={src} alt={nom ? `${nom}${vue ? `, ${vue.toLowerCase()}` : ''}` : ''} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  return (
    <div className={`motif relative grid h-full w-full place-items-center ${className}`} style={{ backgroundColor: teinte }} role="img" aria-label={nom ? `${nom} : photo à venir` : 'Photo à venir'}>
      {!petit && (
        <span className="flex flex-col items-center gap-2 text-center text-encre/45">
          <IconPhoto />
          <span className="text-xs font-bold uppercase tracking-[0.14em]">Photo à venir</span>
          {vue && <span className="text-xs">{vue}</span>}
        </span>
      )}
      {petit && <span className="text-encre/35"><IconPhoto /></span>}
    </div>
  );
}
