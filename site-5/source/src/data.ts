// Catalogue de la boutique. Prix de lancement à confirmer avec le fournisseur.
// Les photos seront ajoutées plus tard : en attendant, chaque produit a un emplacement « Photo à venir ».
export type Rayon = 'dormir' | 'repas' | 'balade' | 'jeux';

export interface Variante { id: string; label: string; price: number; detail?: string }
export interface Coloris { id: string; label: string; hex: string }
export interface Produit {
  id: string;
  nom: string;
  accroche: string;
  rayon: Rayon;
  teinte: string;
  variantes: Variante[];
  coloris: Coloris[];
  description: string;
  points: string[];
  caracteristiques: [string, string][];
  entretien: string;
  badge?: 'Meilleure vente' | 'Nouveau';
  vues: string[];
}

export const RAYONS: { id: Rayon; label: string; phrase: string; teinte: string }[] = [
  { id: 'dormir', label: 'Dormir', phrase: 'Paniers orthopédiques, coussins et plaids', teinte: '#efe4d2' },
  { id: 'repas', label: 'Repas', phrase: 'Gamelles anti-glouton et surélevées', teinte: '#dfe9e1' },
  { id: 'balade', label: 'Balade', phrase: 'Harnais, laisses et accessoires', teinte: '#dde6ef' },
  { id: 'jeux', label: 'Jeux', phrase: 'Jouets d’occupation et à friandises', teinte: '#f1e0da' },
];

const sable: Coloris = { id: 'sable', label: 'Sable', hex: '#d9c4a0' };
const galet: Coloris = { id: 'galet', label: 'Galet', hex: '#a9adb2' };
const sauge: Coloris = { id: 'sauge', label: 'Sauge', hex: '#9db59a' };
const anthracite: Coloris = { id: 'anthracite', label: 'Anthracite', hex: '#3d4146' };
const terracotta: Coloris = { id: 'terracotta', label: 'Terracotta', hex: '#c8785a' };
const marine: Coloris = { id: 'marine', label: 'Marine', hex: '#2f4a6b' };

const LIVRAISON = 'Expédition suivie vers la France. Le délai exact et les frais s’affichent avant le paiement. Tu as 14 jours après réception pour changer d’avis.';

export const PRODUITS: Produit[] = [
  {
    id: 'panier-nuage', nom: 'Panier orthopédique Nuage', accroche: 'Mousse à mémoire de forme, rebords sur 3 côtés', rayon: 'dormir', teinte: '#efe4d2', badge: 'Meilleure vente',
    variantes: [
      { id: 'S', label: 'S', price: 89, detail: '60 × 45 cm · jusqu’à 10 kg' },
      { id: 'M', label: 'M', price: 109, detail: '80 × 60 cm · jusqu’à 25 kg' },
      { id: 'L', label: 'L', price: 129, detail: '100 × 75 cm · jusqu’à 40 kg' },
      { id: 'XL', label: 'XL', price: 149, detail: '120 × 90 cm · jusqu’à 60 kg' },
    ],
    coloris: [sable, galet, anthracite],
    description: 'Un vrai matelas pour ton chien : une couche de mousse à mémoire de forme posée sur une mousse de soutien, pour répartir son poids et l’aider à se relever. Les rebords lui servent d’appui-tête, l’entrée basse évite d’enjamber.',
    points: ['Mousse à mémoire de forme + mousse de soutien', 'Rebords sur 3 côtés, entrée basse', 'Housse déhoussable, lavable à 30 °C', 'Dessous antidérapant'],
    caracteristiques: [['Épaisseur du couchage', '10 cm'], ['Housse', 'Polyester doux, fermeture éclair'], ['Dessous', 'Antidérapant, déperlant'], ['Origine', 'Fabriqué en Chine, contrôlé avant envoi']],
    entretien: 'Housse lavable en machine à 30 °C, séchage à plat. La mousse ne se lave pas : aère-la régulièrement.',
    vues: ['Vue de face', 'Avec un chien', 'Détail de la mousse', 'Dessous antidérapant'],
  },
  {
    id: 'coussin-donut', nom: 'Coussin rond Douillet', accroche: 'Bords rebondis, fausse fourrure', rayon: 'dormir', teinte: '#f1e0da', badge: 'Nouveau',
    variantes: [{ id: 'S', label: 'Ø 60 cm', price: 39 }, { id: 'M', label: 'Ø 80 cm', price: 49 }, { id: 'L', label: 'Ø 100 cm', price: 59 }],
    coloris: [sable, galet, terracotta],
    description: 'Le coussin rond où il aime se rouler en boule. Les bords rebondis lui servent d’appui, la fausse fourrure est très douce.',
    points: ['Bords rebondis tout autour', 'Fausse fourrure douce', 'Lavable en machine', 'Fond antidérapant'],
    caracteristiques: [['Garnissage', 'Fibres creuses'], ['Revêtement', 'Fausse fourrure'], ['Fond', 'Antidérapant']],
    entretien: 'Lavable en machine à 30 °C, programme délicat.',
    vues: ['Vue de dessus', 'Avec un chien', 'Détail de la fourrure'],
  },
  {
    id: 'plaid-doudou', nom: 'Plaid imperméable Doudou', accroche: 'Protège canapé et lit', rayon: 'dormir', teinte: '#efe4d2',
    variantes: [{ id: 'M', label: '100 × 70 cm', price: 29 }, { id: 'L', label: '150 × 100 cm', price: 39 }],
    coloris: [sable, galet, sauge],
    description: 'Doux dessus, imperméable dessous : le plaid à poser sur le canapé, le lit ou dans la voiture.',
    points: ['Couche imperméable', 'Très doux', 'Lavable en machine'],
    caracteristiques: [['Dessus', 'Polaire douce'], ['Dessous', 'Couche imperméable']],
    entretien: 'Lavable en machine à 30 °C.',
    vues: ['À plat', 'Sur un canapé', 'Détail des couches'],
  },
  {
    id: 'tapis-voyage', nom: 'Tapis de voyage roulable', accroche: 'Se roule, se lave, part partout', rayon: 'dormir', teinte: '#dde6ef',
    variantes: [{ id: 'M', label: '70 × 50 cm', price: 39 }, { id: 'L', label: '100 × 70 cm', price: 49 }],
    coloris: [marine, galet],
    description: 'Un couchage qui se roule avec sa sangle : pratique en vacances, chez des amis ou dans la voiture.',
    points: ['Se roule avec sa sangle', 'Dessous imperméable', 'Lavable en machine'],
    caracteristiques: [['Épaisseur', '3 cm'], ['Dessous', 'Imperméable']],
    entretien: 'Lavable en machine à 30 °C.',
    vues: ['Déroulé', 'Roulé avec sa sangle', 'En voiture'],
  },
  {
    id: 'gamelle-zen', nom: 'Gamelle anti-glouton Zen', accroche: 'Le labyrinthe qui ralentit le repas', rayon: 'repas', teinte: '#dfe9e1', badge: 'Meilleure vente',
    variantes: [{ id: 'U', label: 'Ø 22 cm · 500 ml', price: 19 }],
    coloris: [sauge, terracotta, anthracite],
    description: 'Le relief en labyrinthe oblige ton chien à manger plus lentement. Le repas dure plus longtemps.',
    points: ['Relief en labyrinthe', 'Base antidérapante', 'Passe au lave-vaisselle'],
    caracteristiques: [['Matière', 'Plastique alimentaire sans BPA'], ['Contenance', '500 ml']],
    entretien: 'Lave-vaisselle, panier du haut.',
    vues: ['Vue de dessus', 'Avec des croquettes', 'Base antidérapante'],
  },
  {
    id: 'gamelle-haute', nom: 'Gamelle surélevée double', accroche: 'Deux bols inox à bonne hauteur', rayon: 'repas', teinte: '#dfe9e1', badge: 'Nouveau',
    variantes: [{ id: 'M', label: 'Hauteur 15 cm', price: 35 }, { id: 'L', label: 'Hauteur 25 cm', price: 45 }],
    coloris: [sable, anthracite],
    description: 'Un support en bois avec deux bols en inox, pour manger et boire sans trop baisser la tête.',
    points: ['Deux bols inox amovibles', 'Support en bois', 'Pieds antidérapants'],
    caracteristiques: [['Bols', 'Inox, 2 × 800 ml'], ['Support', 'Bois']],
    entretien: 'Bols au lave-vaisselle. Support : chiffon humide.',
    vues: ['Vue de face', 'Avec un chien', 'Bols retirés'],
  },
  {
    id: 'harnais-souple', nom: 'Harnais confort Souple', accroche: 'Rembourré, réglable en 4 points', rayon: 'balade', teinte: '#dde6ef', badge: 'Meilleure vente',
    variantes: [
      { id: 'S', label: 'S', price: 34, detail: 'Poitrail 40–55 cm' },
      { id: 'M', label: 'M', price: 34, detail: 'Poitrail 55–70 cm' },
      { id: 'L', label: 'L', price: 39, detail: 'Poitrail 70–90 cm' },
    ],
    coloris: [terracotta, marine, sauge],
    description: 'Un harnais rembourré qui ne serre pas la gorge, avec deux points d’attache et des bandes réfléchissantes.',
    points: ['Ne serre pas la gorge', 'Réglable en 4 points', 'Bandes réfléchissantes', 'Deux points d’attache'],
    caracteristiques: [['Matière', 'Nylon rembourré'], ['Attaches', 'Dos et poitrail']],
    entretien: 'Lavage à la main, eau tiède.',
    vues: ['Vue de face', 'Porté', 'Détail des réglages'],
  },
  {
    id: 'laisse-mains-libres', nom: 'Laisse réglable 2 m', accroche: 'Se porte à la main ou en bandoulière', rayon: 'balade', teinte: '#dde6ef',
    variantes: [{ id: 'U', label: '2 m', price: 24 }],
    coloris: [terracotta, marine, sauge],
    description: 'Une laisse avec plusieurs anneaux pour régler la longueur, à porter à la main ou en bandoulière.',
    points: ['Longueur réglable', 'Poignée rembourrée', 'Mousqueton solide'],
    caracteristiques: [['Longueur', '2 m réglable'], ['Matière', 'Nylon tressé']],
    entretien: 'Lavage à la main.',
    vues: ['Enroulée', 'En bandoulière', 'Détail du mousqueton'],
  },
  {
    id: 'balle-friandise', nom: 'Balle à friandises', accroche: 'Il roule, il cherche, il s’occupe', rayon: 'jeux', teinte: '#f1e0da',
    variantes: [{ id: 'U', label: 'Ø 8 cm', price: 15 }],
    coloris: [terracotta, sauge],
    description: 'On glisse des croquettes dedans, il la fait rouler pour les faire tomber. Idéal quand il reste seul un moment.',
    points: ['Caoutchouc naturel souple', 'Trappe réglable', 'Se lave à l’eau chaude'],
    caracteristiques: [['Matière', 'Caoutchouc naturel'], ['Diamètre', '8 cm']],
    entretien: 'Eau chaude savonneuse.',
    vues: ['Vue de face', 'En jeu', 'Remplissage'],
  },
  {
    id: 'tapis-fouille', nom: 'Tapis de fouille', accroche: 'Le flair au travail, 10 minutes de calme', rayon: 'jeux', teinte: '#f1e0da', badge: 'Nouveau',
    variantes: [{ id: 'U', label: '50 × 50 cm', price: 29 }],
    coloris: [sauge, galet],
    description: 'On cache des friandises dans les bandes de tissu, il les cherche avec son nez.',
    points: ['Fait travailler le flair', 'Lavable en machine', 'Dessous antidérapant'],
    caracteristiques: [['Matière', 'Feutrine'], ['Dimensions', '50 × 50 cm']],
    entretien: 'Lavable en machine à 30 °C.',
    vues: ['Vue de dessus', 'En jeu', 'Détail des bandes'],
  },
];

export const LIVRAISON_TEXTE = LIVRAISON;
export const euros = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const prixMin = (p: Produit) => Math.min(...p.variantes.map((v) => v.price));
export const trouve = (id: string) => PRODUITS.find((p) => p.id === id);
export const sansAccent = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
