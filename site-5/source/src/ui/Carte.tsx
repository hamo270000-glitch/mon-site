import { useRef } from 'react';
import { euros, prixMin, type Produit } from '../data';
import { lien } from '../router';
import Visuel from './Visuel';
import Ajouter from './Ajouter';

// Carte produit : au survol, la 2e photo apparaît et le bouton d'ajout rapide monte.
export default function Carte({ p }: { p: Produit }) {
  const image = useRef<HTMLDivElement>(null);
  const v = p.variantes.find((x) => x.id === 'M') ?? p.variantes[0];
  const plusieurs = p.variantes.length > 1;

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-ligne">
        <a href={lien.produit(p.id)} className="block" aria-label={p.nom}>
          <div ref={image} className="relative aspect-square">
            <Visuel teinte={p.teinte} vue={p.vues[0]} nom={p.nom} />
            {p.vues[1] && (
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true">
                <Visuel teinte={p.teinte} vue={p.vues[1]} />
              </div>
            )}
          </div>
        </a>
        {p.badge && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${p.badge === 'Nouveau' ? 'bg-white text-foret ring-1 ring-ligne' : 'bg-foret text-creme'}`}>{p.badge}</span>
        )}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block">
          {plusieurs
            ? <a href={lien.produit(p.id)} className="flex min-h-11 items-center justify-center rounded-full bg-white/95 font-bold text-encre shadow-md backdrop-blur hover:bg-white">Choisir la taille</a>
            : <div className="[&>button]:w-full"><Ajouter id={p.id} variante={v.id} coloris={p.coloris[0].id} image={image} label="Ajout rapide" /></div>}
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        <h3 className="text-[1.05rem] font-semibold leading-snug"><a href={lien.produit(p.id)} className="hover:text-foret hover:underline">{p.nom}</a></h3>
        <p className="text-sm text-doux">{p.accroche}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="chiffres font-bold">{plusieurs && <span className="font-normal text-doux">dès </span>}{euros(prixMin(p))}</p>
          <span className="flex gap-1" aria-label={`${p.coloris.length} coloris : ${p.coloris.map((c) => c.label).join(', ')}`}>
            {p.coloris.map((c) => <span key={c.id} className="size-3.5 rounded-full ring-1 ring-encre/15" style={{ background: c.hex }} />)}
          </span>
        </div>
      </div>
    </article>
  );
}
