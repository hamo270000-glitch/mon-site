// Veilleuse : un seul produit, le panier, en 4 tailles. Mesures provisoires, à confirmer avec l'échantillon du fournisseur.
export type SizeId = 'S' | 'M' | 'L' | 'XL';

export interface Size {
  id: SizeId;
  outer: [number, number]; // dimensions extérieures (cm)
  maxLength: number; // longueur max. du chien allongé, museau → base de la queue (cm) = longueur du panier − 15 à 22 cm
  maxWeight: number; // kg
  price: number; // €
  example: string;
}

export const SIZES: Size[] = [
  { id: 'S', outer: [70, 55], maxLength: 55, maxWeight: 12, price: 95, example: 'teckel, jack russell' },
  { id: 'M', outer: [90, 70], maxLength: 72, maxWeight: 25, price: 119, example: 'beagle, cocker' },
  { id: 'L', outer: [110, 85], maxLength: 90, maxWeight: 40, price: 139, example: 'labrador, golden retriever' },
  { id: 'XL', outer: [130, 100], maxLength: 108, maxWeight: 65, price: 159, example: 'berger allemand, bouvier bernois' },
];

// Taille conseillée : la plus petite qui convient à la fois à la longueur et au poids.
export const sizeFor = (len: number, kg: number) => SIZES.find((s) => len <= s.maxLength && kg <= s.maxWeight) ?? SIZES[SIZES.length - 1];
export const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;

// Photos : recadrages des 6 photos du fournisseur (source/public/vues/), sans les textes publicitaires du fournisseur.
export const PHOTOS = [
  { src: './vues/vue-1.jpg', mini: './vues/vue-1-mini.jpg', w: 1100, h: 825, alt: 'Un golden retriever allongé sur le panier Veilleuse, les pattes avant posées sur la mousse, la tête relevée devant le traversin du fond.' },
  { src: './vues/vue-2.jpg', mini: './vues/vue-2-mini.jpg', w: 1010, h: 675, alt: 'Le panier Veilleuse vide sur un tapis tressé crème, dans une pièce claire : housse matelassée beige-taupe à chevrons, traversins arrondis sur trois côtés.' },
  { src: './vues/vue-4.jpg', mini: './vues/vue-4-mini.jpg', w: 1030, h: 297, alt: 'Le couchage vu de face : le fond matelassé à chevrons, entouré des traversins du fond et des côtés.' },
  { src: './vues/vue-3.jpg', mini: './vues/vue-3-mini.jpg', w: 740, h: 264, alt: 'Gros plan sur le bout d’un traversin : tissu matelassé à chevrons et passepoil cousu.' },
  { src: './vues/vue-5.jpg', mini: './vues/vue-5-mini.jpg', w: 642, h: 220, alt: 'Le panier Veilleuse vu de trois quarts sur fond crème, avec sa petite étiquette camel cousue à l’avant.' },
  { src: './vues/vue-6.jpg', mini: './vues/vue-6-mini.jpg', w: 733, h: 254, alt: 'Le panier posé sur un tapis en jute : l’avant reste bas et ouvert, sans traversin.' },
];
