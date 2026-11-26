// Veilleuse : un seul produit, le panier, en 4 tailles. Mesures provisoires, à confirmer avec l'échantillon du fournisseur.
export type SizeId = 'S' | 'M' | 'L' | 'XL';

export interface Size {
  id: SizeId;
  label: string;
  outer: [number, number];
  maxLength: number; // longueur du chien couché, truffe → base de la queue (cm)
  maxWeight: number; // kg
  price: number; // €
  example: string;
}

export const SIZES: Size[] = [
  { id: 'S', label: 'Petit', outer: [70, 55], maxLength: 55, maxWeight: 12, price: 95, example: 'Teckel, Jack Russell, Bichon' },
  { id: 'M', label: 'Moyen', outer: [90, 70], maxLength: 72, maxWeight: 25, price: 119, example: 'Beagle, Cocker, Épagneul' },
  { id: 'L', label: 'Grand', outer: [110, 85], maxLength: 90, maxWeight: 40, price: 139, example: 'Labrador, Golden, Setter' },
  { id: 'XL', label: 'Très grand', outer: [130, 100], maxLength: 108, maxWeight: 65, price: 159, example: 'Berger allemand, Bouvier bernois' },
];

export const LAYERS = [
  { name: 'Housse velours ras', detail: 'Lavable à 30 °C, fermeture éclair', tone: '#b9b5ad' },
  { name: 'Mousse à mémoire de forme', detail: '6 cm · épouse épaules et hanches', tone: '#efe9dc' },
  { name: 'Mousse de soutien', detail: '8 cm · haute densité, ne s’affaisse pas', tone: '#6f8b7b' },
  { name: 'Fond antidérapant', detail: 'Reste en place quand il se relève', tone: '#1f2528' },
];

export const sizeFor = (len: number, kg: number) => SIZES.find((s) => len <= s.maxLength && kg <= s.maxWeight) ?? SIZES[SIZES.length - 1];
export const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;
