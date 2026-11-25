// Catalogue de Museau Gris : un seul produit, « Le Doyen », 4 tailles, 3 coloris.
// Les mesures et les couches sont provisoires : à confirmer avec l'échantillon du fournisseur.

export type SizeId = 'S' | 'M' | 'L' | 'XL';
export type ColorId = 'argent' | 'sauge' | 'nuit';

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
  { id: 'S', label: 'Petit', outer: [70, 55], sleep: [56, 40], maxLength: 55, maxWeight: 12, price: 95, example: 'Teckel, Jack Russell, Bichon' },
  { id: 'M', label: 'Moyen', outer: [90, 70], sleep: [74, 54], maxLength: 72, maxWeight: 25, price: 119, example: 'Beagle, Cocker, Épagneul breton' },
  { id: 'L', label: 'Grand', outer: [110, 85], sleep: [92, 68], maxLength: 90, maxWeight: 40, price: 139, example: 'Labrador, Golden, Setter' },
  { id: 'XL', label: 'Très grand', outer: [130, 100], sleep: [110, 80], maxLength: 108, maxWeight: 65, price: 159, example: 'Berger allemand, Bouvier bernois, Leonberg' },
];

export interface Color {
  id: ColorId;
  label: string;
  note: string;
  cover: string; // couleur de la housse dans la scène 3D
  bolster: string;
}

export const COLORS: Color[] = [
  { id: 'argent', label: 'Gris museau', note: 'Le gris doux des vieux chiens', cover: '#b9bec0', bolster: '#9da3a6' },
  { id: 'sauge', label: 'Sauge', note: 'Un vert calme, pour un salon clair', cover: '#8fa89b', bolster: '#768f82' },
  { id: 'nuit', label: 'Bleu nuit', note: 'Ne marque pas les poils sombres', cover: '#2f4450', bolster: '#243641' },
];

export interface Layer {
  name: string;
  thickness: string;
  role: string;
  tone: string; // couleur de la couche dans la vue éclatée et dans la transition
}

// Du haut vers le bas.
export const LAYERS: Layer[] = [
  { name: 'Housse velours ras', thickness: 'tissu', role: 'Douce sous les coudes calleux. Elle s’enlève avec une fermeture éclair et passe en machine à 30 °C.', tone: '#b9bec0' },
  { name: 'Mousse à mémoire de forme', thickness: '6 cm', role: 'Elle se moule sous l’épaule et la hanche au lieu de les repousser, puis reprend lentement sa forme.', tone: '#efe7da' },
  { name: 'Mousse de soutien haute densité', thickness: '8 cm', role: 'Plus ferme : même un grand chien ne « touche pas le fond ».', tone: '#6f8a7d' },
  { name: 'Fond antidérapant', thickness: '0,5 cm', role: 'Le panier ne glisse pas quand le chien s’appuie dessus pour se relever.', tone: '#1c2a30' },
];

export const PRODUCT = {
  name: 'Le Doyen',
  tagline: 'Panier orthopédique pour chien âgé',
};

export function sizeFor(lengthCm: number, weightKg: number): Size {
  return SIZES.find((s) => lengthCm <= s.maxLength && weightKg <= s.maxWeight) ?? SIZES[SIZES.length - 1];
}

export const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;
