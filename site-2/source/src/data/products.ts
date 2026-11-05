// Catalogue de la boutique. Pour ajouter un produit : copier un bloc et changer les valeurs.
// « shape » choisit le dessin du flacon, « tint » sa couleur, « ink » la couleur du bouchon.

export type Shape = 'flacon' | 'pot' | 'tube' | 'pompe' | 'stick';
export type Category = 'Visage' | 'Corps' | 'Lèvres' | 'Cheveux';

export interface Product {
  id: string;
  name: string;
  kind: string;
  category: Category;
  price: number;
  size: string;
  shape: Shape;
  tint: string;
  ink: string;
  short: string;
  description: string;
  ingredients: string[];
  use: string;
  isNew?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'serum-goutte', name: 'Goutte de rosée', kind: 'Sérum hydratant', category: 'Visage',
    price: 29, size: '30 ml', shape: 'flacon', tint: '#BFDCD4', ink: '#2F4F47', isNew: true,
    short: 'Repulpe et désaltère la peau dès le matin.',
    description: 'Un sérum aqueux qui pénètre en quelques secondes. La peau paraît plus rebondie, le teint plus frais, sans effet collant.',
    ingredients: ['Acide hyaluronique 2 %', 'Niacinamide 4 %', 'Eau de concombre'],
    use: '3 gouttes matin et soir sur peau propre, avant la crème.',
  },
  {
    id: 'creme-nuage', name: 'Nuage', kind: 'Crème hydratante', category: 'Visage',
    price: 26, size: '50 ml', shape: 'pot', tint: '#F4D5DC', ink: '#7A3B4D',
    short: 'Une texture fouettée qui nourrit sans graisser.',
    description: 'Une crème légère comme une mousse qui garde la peau confortable toute la journée. Convient aux peaux normales à sèches.',
    ingredients: ['Beurre de karité', 'Céramides', 'Squalane d’olive'],
    use: 'Une noisette matin et soir, après le sérum.',
  },
  {
    id: 'gel-source', name: 'Source', kind: 'Gel nettoyant doux', category: 'Visage',
    price: 16, size: '150 ml', shape: 'pompe', tint: '#D5E4C6', ink: '#3E5A2E',
    short: 'Lave en douceur, sans tiraillement.',
    description: 'Un gel qui mousse légèrement et retire impuretés et maquillage léger en respectant la barrière de la peau.',
    ingredients: ['Tensioactifs doux d’origine végétale', 'Aloe vera', 'Panthénol'],
    use: 'Faire mousser sur peau humide, masser 30 secondes, rincer.',
  },
  {
    id: 'masque-argile', name: 'Argile rose', kind: 'Masque purifiant', category: 'Visage',
    price: 19, size: '75 ml', shape: 'tube', tint: '#EDC2BE', ink: '#8A4A44',
    short: 'Affine le grain de peau en 10 minutes.',
    description: 'Un masque crémeux à l’argile rose qui absorbe l’excès de sébum sans dessécher. Idéal une à deux fois par semaine.',
    ingredients: ['Argile rose', 'Kaolin', 'Eau de rose'],
    use: 'Couche fine sur le visage, laisser poser 10 minutes, rincer à l’eau tiède.',
  },
  {
    id: 'contour-eveil', name: 'Éveil', kind: 'Contour des yeux', category: 'Visage',
    price: 22, size: '15 ml', shape: 'tube', tint: '#DAD3EC', ink: '#4B3F73', isNew: true,
    short: 'Défroisse le regard au réveil.',
    description: 'Un gel frais qui lisse le contour de l’œil et atténue l’aspect des poches. Embout métal pour un effet froid.',
    ingredients: ['Caféine', 'Extrait de bleuet', 'Acide hyaluronique'],
    use: 'Tapoter du coin interne vers l’extérieur, matin et soir.',
  },
  {
    id: 'huile-velours', name: 'Velours', kind: 'Huile corps', category: 'Corps',
    price: 24, size: '100 ml', shape: 'flacon', tint: '#F2D6AE', ink: '#7A5523',
    short: 'Une peau satinée, jamais grasse.',
    description: 'Un mélange d’huiles sèches qui pénètre vite et laisse un voile satiné au parfum léger de fleur d’oranger.',
    ingredients: ['Huile de jojoba', 'Huile d’abricot', 'Vitamine E'],
    use: 'Sur peau encore humide après la douche, en massant.',
  },
  {
    id: 'lait-coton', name: 'Coton', kind: 'Lait corps', category: 'Corps',
    price: 18, size: '200 ml', shape: 'pompe', tint: '#EEE7DE', ink: '#5D5146',
    short: 'Hydrate tout le corps en un geste.',
    description: 'Un lait fluide qui s’étale facilement et hydrate 24 heures. Parfum discret de coton propre.',
    ingredients: ['Glycérine végétale', 'Beurre de karité', 'Avoine colloïdale'],
    use: 'Chaque jour sur tout le corps.',
  },
  {
    id: 'baume-petale', name: 'Pétale', kind: 'Baume lèvres', category: 'Lèvres',
    price: 9, size: '4,5 g', shape: 'stick', tint: '#E8A3B4', ink: '#8C2F4A',
    short: 'Nourrit et donne un rose naturel.',
    description: 'Un baume fondant légèrement teinté qui répare les lèvres sèches et laisse un fini rosé.',
    ingredients: ['Cire d’abeille', 'Huile de ricin', 'Pigment rose naturel'],
    use: 'Aussi souvent que nécessaire.',
  },
  {
    id: 'brume-cheveux', name: 'Brume', kind: 'Brume cheveux', category: 'Cheveux',
    price: 15, size: '100 ml', shape: 'pompe', tint: '#CAD6EB', ink: '#344A72',
    short: 'Démêle et fait briller sans alourdir.',
    description: 'Une brume légère qui démêle, protège de la chaleur et laisse un parfum frais toute la journée.',
    ingredients: ['Protéines de riz', 'Aloe vera', 'Eau de bleuet'],
    use: 'Vaporiser sur cheveux humides ou secs, sans rincer.',
  },
];

export const CATEGORIES: ('Tout' | Category)[] = ['Tout', 'Visage', 'Corps', 'Lèvres', 'Cheveux'];

export const FREE_SHIPPING = 40;

export const euro = (v: number) => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: v % 1 ? 2 : 0 });
