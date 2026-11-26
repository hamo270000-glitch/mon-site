// Catalogue de la boutique. Prix de lancement à confirmer avec le fournisseur.
export type Rayon = 'dormir' | 'manger' | 'balader' | 'jouer';
export type ArtId = 'panier' | 'tapis' | 'gamelle' | 'harnais' | 'jouet' | 'plaid';

export interface Variante { id: string; label: string; price: number; detail?: string }
export interface Coloris { id: string; label: string; a: string; b: string }
export interface Produit {
  id: string;
  nom: string;
  accroche: string;
  rayon: Rayon;
  art: ArtId;
  fond: string;
  variantes: Variante[];
  coloris: Coloris[];
  points: string[];
  etoile?: boolean;
}

export const RAYONS: { id: Rayon; label: string; phrase: string; fond: string }[] = [
  { id: 'dormir', label: 'Dormir', phrase: 'Paniers, plaids et tapis', fond: 'var(--color-sable)' },
  { id: 'manger', label: 'Manger', phrase: 'Gamelles qui ralentissent', fond: 'var(--color-menthe)' },
  { id: 'balader', label: 'Balader', phrase: 'Harnais doux et réglables', fond: 'var(--color-ciel)' },
  { id: 'jouer', label: 'Jouer', phrase: 'Jouets à friandises', fond: 'var(--color-rose)' },
];

const BEIGE: Coloris = { id: 'beige', label: 'Sable', a: '#e5cfa7', b: '#c9ab7c' };
const GRIS: Coloris = { id: 'gris', label: 'Galet', a: '#c3c7cc', b: '#9aa0a7' };
const VERT: Coloris = { id: 'vert', label: 'Sauge', a: '#a9c4a6', b: '#7f9e7c' };
const TERRA: Coloris = { id: 'terra', label: 'Terracotta', a: '#e39a74', b: '#c4724c' };
const BLEU: Coloris = { id: 'bleu', label: 'Océan', a: '#7fa6cf', b: '#557fae' };

export const PRODUITS: Produit[] = [
  {
    id: 'panier-nuage', nom: 'Le panier Nuage', accroche: 'Orthopédique, mousse à mémoire de forme',
    rayon: 'dormir', art: 'panier', fond: 'var(--color-sable)', etoile: true,
    variantes: [
      { id: 'S', label: 'S', price: 89, detail: '60 × 45 cm · jusqu’à 10 kg' },
      { id: 'M', label: 'M', price: 109, detail: '80 × 60 cm · jusqu’à 25 kg' },
      { id: 'L', label: 'L', price: 129, detail: '100 × 75 cm · jusqu’à 40 kg' },
      { id: 'XL', label: 'XL', price: 149, detail: '120 × 90 cm · jusqu’à 60 kg' },
    ],
    coloris: [BEIGE, GRIS, VERT],
    points: ['Mousse à mémoire de forme qui épouse le corps', 'Rebords pour poser la tête', 'Housse déhoussable, lavable à 30 °C', 'Dessous antidérapant'],
  },
  {
    id: 'tapis-voyage', nom: 'Tapis de voyage', accroche: 'Se roule, se lave, part partout',
    rayon: 'dormir', art: 'tapis', fond: 'var(--color-ciel)',
    variantes: [{ id: 'M', label: 'M', price: 39, detail: '70 × 50 cm' }, { id: 'L', label: 'L', price: 49, detail: '100 × 70 cm' }],
    coloris: [BLEU, GRIS],
    points: ['Dessous imperméable', 'Se roule avec sa sangle', 'Lavable en machine'],
  },
  {
    id: 'gamelle-zen', nom: 'Gamelle Zen', accroche: 'Le labyrinthe qui ralentit le repas',
    rayon: 'manger', art: 'gamelle', fond: 'var(--color-menthe)',
    variantes: [{ id: 'U', label: 'Taille unique', price: 19, detail: 'Ø 22 cm · 500 ml' }],
    coloris: [VERT, TERRA, BLEU],
    points: ['Relief en labyrinthe : le repas dure plus longtemps', 'Base antidérapante', 'Passe au lave-vaisselle'],
  },
  {
    id: 'harnais-souple', nom: 'Harnais Souple', accroche: 'Rembourré, réglable en 4 points',
    rayon: 'balader', art: 'harnais', fond: 'var(--color-ciel)',
    variantes: [
      { id: 'S', label: 'S', price: 34, detail: 'Tour de poitrail 40–55 cm' },
      { id: 'M', label: 'M', price: 34, detail: 'Tour de poitrail 55–70 cm' },
      { id: 'L', label: 'L', price: 39, detail: 'Tour de poitrail 70–90 cm' },
    ],
    coloris: [TERRA, BLEU, VERT],
    points: ['Ne serre pas la gorge', 'Bandes réfléchissantes', 'Deux points d’attache'],
  },
  {
    id: 'balle-friandise', nom: 'Balle à friandises', accroche: 'Il roule, il cherche, il s’occupe',
    rayon: 'jouer', art: 'jouet', fond: 'var(--color-rose)',
    variantes: [{ id: 'U', label: 'Taille unique', price: 15, detail: 'Ø 8 cm' }],
    coloris: [TERRA, VERT],
    points: ['Caoutchouc naturel souple', 'Trappe réglable pour les croquettes', 'Se lave à l’eau chaude'],
  },
  {
    id: 'plaid-doux', nom: 'Plaid Doudou', accroche: 'Tout doux dessus, imperméable dessous',
    rayon: 'dormir', art: 'plaid', fond: 'var(--color-rose)',
    variantes: [{ id: 'M', label: 'M', price: 29, detail: '100 × 70 cm' }, { id: 'L', label: 'L', price: 39, detail: '150 × 100 cm' }],
    coloris: [BEIGE, TERRA, GRIS],
    points: ['Protège canapé et lit', 'Fausse fourrure très douce', 'Lavable en machine'],
  },
];

export const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const prixMin = (p: Produit) => Math.min(...p.variantes.map((v) => v.price));
export const trouve = (id: string) => PRODUITS.find((p) => p.id === id);
