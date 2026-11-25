// Catalogue de Lové : un seul produit, 4 tailles et 3 coloris.
// Les mesures et les couches sont provisoires : à confirmer avec l'échantillon du fournisseur.

export type SizeId = 'S' | 'M' | 'L' | 'XL';
export type ColorId = 'beige' | 'gris' | 'chocolat' | 'noir';

export interface Size {
  id: SizeId;
  label: string;
  outer: [number, number]; // longueur × largeur extérieures, en cm
  sleep: [number, number]; // surface de couchage, en cm
  maxLength: number; // longueur du chien (truffe → base de la queue), en cm
  maxWeight: number; // kg
  price: number; // €
  example: string;
}

export const SIZES: Size[] = [
  { id: 'S', label: 'Petit', outer: [70, 55], sleep: [56, 40], maxLength: 55, maxWeight: 12, price: 89, example: 'Teckel, Jack Russell, Shih Tzu' },
  { id: 'M', label: 'Moyen', outer: [90, 70], sleep: [74, 54], maxLength: 72, maxWeight: 25, price: 109, example: 'Beagle, Cocker, Border Collie' },
  { id: 'L', label: 'Grand', outer: [110, 85], sleep: [92, 68], maxLength: 90, maxWeight: 40, price: 129, example: 'Labrador, Golden, Berger australien' },
  { id: 'XL', label: 'Très grand', outer: [130, 100], sleep: [110, 80], maxLength: 108, maxWeight: 60, price: 149, example: 'Berger allemand, Bouvier bernois' },
];

export interface Theme {
  dark: boolean;
  bg: string;
  bg2: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  onAccent: string;
  glow: string; // lumière sous le panier
  lines: string; // couleur des lignes du fond animé
}

export interface Color {
  id: ColorId;
  label: string;
  cover: string; // couleur de la housse dans la scène 3D
  bolster: string;
  glow: string;
  theme: Theme; // l'ambiance du site quand ce coloris est choisi
}

// Coloris clairs → site clair ; coloris foncés → site foncé.
export const COLORS: Color[] = [
  {
    id: 'beige', label: 'Beige', cover: '#d8c3a0', bolster: '#c2a77d', glow: '#ffb070',
    theme: { dark: false, bg: '#ffd9b6', bg2: '#ffc895', text: '#3b1d0c', muted: '#7a4526', accent: '#e2452c', accent2: '#c93a22', onAccent: '#fff7f0', glow: '#ffb070', lines: '#e3925a' },
  },
  {
    id: 'gris', label: 'Gris perle', cover: '#b9bdc4', bolster: '#9ea3ab', glow: '#a3b9ff',
    theme: { dark: false, bg: '#d3dfff', bg2: '#bccdff', text: '#131d48', muted: '#3d4c85', accent: '#ff4b88', accent2: '#e63a75', onAccent: '#ffffff', glow: '#a3b9ff', lines: '#7f98ee' },
  },
  {
    id: 'chocolat', label: 'Chocolat', cover: '#6a4630', bolster: '#553624', glow: '#ff8a3c',
    theme: { dark: true, bg: '#4a2315', bg2: '#5b2d1b', text: '#ffe2c8', muted: '#e6ab84', accent: '#ffb33c', accent2: '#ffc464', onAccent: '#3a1906', glow: '#ff8a3c', lines: '#a35a38' },
  },
  {
    id: 'noir', label: 'Noir', cover: '#2c2c31', bolster: '#1f1f23', glow: '#ff4b88',
    theme: { dark: true, bg: '#141015', bg2: '#1f1a21', text: '#ffe8f1', muted: '#bda7b5', accent: '#ff4b88', accent2: '#ff6f9f', onAccent: '#1a0610', glow: '#ff4b88', lines: '#53404d' },
  },
];

export interface Layer {
  name: string;
  thickness: string;
  role: string;
  tone: string; // couleur de la couche dans la vue éclatée
}

// Du haut vers le bas.
export const LAYERS: Layer[] = [
  { name: 'Housse déhoussable', thickness: 'tissu', role: 'Douce au toucher, elle s’enlève avec une fermeture éclair et passe en machine.', tone: '#d9532a' },
  { name: 'Mousse à mémoire de forme', thickness: '5 cm', role: 'Elle épouse les épaules et les hanches, puis reprend lentement sa forme.', tone: '#ece6d6' },
  { name: 'Mousse de soutien', thickness: '7 cm', role: 'Plus ferme : elle empêche le chien de toucher le sol, même les grands gabarits.', tone: '#8d8f98' },
  { name: 'Semelle antidérapante', thickness: '0,5 cm', role: 'Le panier reste en place quand le chien se couche ou se relève.', tone: '#2a2a30' },
];

export const PRODUCT = {
  name: 'Le panier Lové',
  tagline: 'Panier orthopédique à mémoire de forme',
};

export function sizeFor(lengthCm: number, weightKg: number): Size {
  return SIZES.find((s) => lengthCm <= s.maxLength && weightKg <= s.maxWeight) ?? SIZES[SIZES.length - 1];
}

export const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;
