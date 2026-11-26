import { useEffect, type ReactNode } from 'react';
import { lien } from '../router';
import { PRODUITS } from '../data';

// Pages d'aide et pages légales. Les textes légaux définitifs seront à compléter avec les infos de l'entreprise.
const SECTIONS: { id: string; titre: string; contenu: ReactNode }[] = [
  { id: 'livraison', titre: 'Livraison', contenu: <><p>Les commandes sont expédiées avec un numéro de suivi, envoyé par e-mail.</p><p>Le délai et les frais exacts sont affichés avant le paiement. Ils seront précisés ici à l’ouverture de la boutique.</p></> },
  { id: 'retours', titre: 'Retours et remboursements', contenu: <><p>Tu as 14 jours après réception pour changer d’avis, sans avoir à te justifier (droit de rétractation).</p><p>Le produit doit être renvoyé dans son état d’origine. Le remboursement est fait sous 14 jours après réception du retour.</p></> },
  { id: 'tailles', titre: 'Guide des tailles', contenu: <><p>Pour un panier : mesure ton chien couché, du bout du nez à la base de la queue, et ajoute 15 à 20 cm.</p>
    <div className="overflow-x-auto"><table className="mt-2 w-full min-w-[28rem] text-left text-sm"><thead><tr className="border-b border-ligne"><th className="py-2">Panier Nuage</th><th>Dimensions</th><th>Prix</th></tr></thead>
      <tbody>{PRODUITS[0].variantes.map((v) => <tr key={v.id} className="border-b border-ligne"><td className="py-2 font-semibold">{v.label}</td><td>{v.detail}</td><td className="chiffres">{v.price} €</td></tr>)}</tbody></table></div>
    <p>Pour un harnais : mesure le tour du poitrail, juste derrière les pattes avant.</p></> },
  { id: 'contact', titre: 'Nous contacter', contenu: <><p>Une question sur un produit ou une commande ? Le formulaire de contact et l’adresse e-mail du service client seront ajoutés à l’ouverture.</p><p>Nous répondons sous 24 h ouvrées.</p></> },
  { id: 'cgv', titre: 'Conditions générales de vente', contenu: <p>À compléter avant l’ouverture : identité du vendeur, prix, commande, paiement, livraison, droit de rétractation, garanties légales (conformité et vices cachés), médiation.</p> },
  { id: 'mentions', titre: 'Mentions légales', contenu: <p>À compléter : nom ou raison sociale, adresse, numéro SIRET, contact, hébergeur du site.</p> },
  { id: 'confidentialite', titre: 'Confidentialité', contenu: <p>À compléter : données collectées (commande, e-mail), usage, durée de conservation et droits (accès, rectification, suppression).</p> },
];

export default function Aide({ section }: { section?: string }) {
  useEffect(() => {
    if (section) document.getElementById(section)?.scrollIntoView({ block: 'start' });
  }, [section]);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <h1 className="text-[clamp(1.9rem,4vw,2.8rem)] text-foret">Aide et informations</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Sommaire" className="lg:sticky lg:top-32 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => <li key={s.id}><a href={lien.aide(s.id)} className={`block rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-ligne lg:ring-0 hover:bg-creme-2 ${section === s.id ? 'bg-creme-2 text-foret' : ''}`}>{s.titre}</a></li>)}
          </ul>
        </nav>
        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-36 rounded-2xl bg-white p-6 ring-1 ring-ligne">
              <h2 className="text-xl">{s.titre}</h2>
              <div className="mt-3 space-y-3 text-doux">{s.contenu}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
