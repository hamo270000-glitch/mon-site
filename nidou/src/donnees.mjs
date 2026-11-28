// Catalogue Nidou : mêmes 9 paniers et prix que les maquettes (Sites 7 à 10).
export const MARQUE = {
  nom: 'Nidou',
  slogan: 'Couchage pour chiens',
  description: 'Paniers orthopédiques pour chien en mousse à mémoire de forme, du S au XXL. Pré-commande sans paiement immédiat.',
};

export const RACES = {
  S: 'Chihuahua, Yorkshire, Bichon, Teckel',
  M: 'Beagle, Carlin, Shih Tzu, Jack Russell',
  L: 'Border Collie, Cocker, Berger australien, Bouledogue',
  XL: 'Labrador, Golden Retriever, Husky, Boxer',
  XXL: 'Berger allemand, Bouvier bernois, Dogue allemand, Malinois',
  Unique: 'toi et ton chien, côte à côte',
};
export const POIDS = { S: 'jusqu’à 10 kg', M: '10 à 20 kg', L: '20 à 32 kg', XL: '32 à 45 kg', XXL: 'plus de 45 kg' };

export const PRODUITS = [
  { slug: 'canape-a-rebords', nom: 'Canapé orthopédique à rebords', couleur: 'Beige', cat: 'Canapés', badge: 'Meilleure vente', f: ['top'],
    court: 'Rebords appui-tête et mousse à mémoire de forme, pour les grands dormeurs.',
    long: 'Le grand classique : un couchage en mousse à mémoire de forme qui épouse le corps de ton chien, et des rebords moelleux sur trois côtés pour poser la tête. Son look canapé beige se fond dans le salon.',
    t: { S: ['61 × 46 cm', 109.9], M: ['76 × 56 cm', 139.9], L: ['91 × 69 cm', 169.9], XL: ['114 × 89 cm', 199.9], XXL: ['135 × 107 cm', 239.9] } },
  { slug: 'canape-bas', nom: 'Canapé bas, entrée facile', couleur: 'Crème', cat: 'Canapés', f: ['top', 'nouveau'],
    court: 'Une entrée surbaissée pour monter sans effort : idéal pour les chiens âgés.',
    long: 'Les chiens âgés ou aux articulations fragiles ont parfois du mal à monter dans un panier haut. Ce canapé a une entrée surbaissée pour s’installer sans effort, sur un couchage en mousse à mémoire de forme.',
    t: { S: ['61 × 41 cm', 109.9], M: ['76 × 51 cm', 139.9], L: ['91 × 69 cm', 169.9], XL: ['102 × 81 cm', 199.9], XXL: ['135 × 107 cm', 239.9] } },
  { slug: 'canape-3-rebords', nom: 'Canapé 3 rebords', couleur: 'Brun', cat: 'Canapés', f: ['top'],
    court: 'Rebords sur 3 côtés et passepoil orange, un vrai petit canapé.',
    long: 'Un vrai petit canapé pour ton chien : trois rebords rembourrés qui servent d’oreiller et donnent un coin à lui, un tissu brun facile à vivre et un passepoil orange.',
    t: { S: ['61 × 41 cm', 109.9], M: ['76 × 51 cm', 139.9], L: ['91 × 69 cm', 169.9], XL: ['114 × 89 cm', 199.9], XXL: ['135 × 107 cm', 239.9] } },
  { slug: 'canape-carre', nom: 'Canapé carré', couleur: 'Gris foncé', cat: 'Canapés', f: ['grand'],
    court: 'Grand format avec rebords tout autour, pour les chiens qui s’étalent.',
    long: 'Pour les grands chiens qui aiment s’étaler : un format généreux, des rebords tout autour et un couchage ferme qui garde sa forme nuit après nuit.',
    t: { L: ['91 × 69 cm', 169.9], XL: ['114 × 89 cm', 199.9], XXL: ['135 × 107 cm', 239.9] } },
  { slug: 'lit-taille-humaine', nom: 'Lit taille humaine', couleur: 'Gris clair', cat: 'Lit géant', badge: 'Nouveau', f: ['nouveau', 'grand'],
    court: 'Fausse fourrure moelleuse, assez grand pour toi et ton chien.',
    long: '183 × 122 cm de fausse fourrure moelleuse pour faire la sieste avec ton chien. Assez grand pour vous deux, assez doux pour ne plus en sortir.',
    t: { Unique: ['183 × 122 cm', 219.9] } },
  { slug: 'panier-ovale', nom: 'Panier ovale', couleur: 'Camel', cat: 'Paniers', f: ['top'],
    court: 'Pour les chiens qui aiment dormir en boule, bords tout autour.',
    long: 'Pour les chiens qui dorment en boule : une forme ovale avec des bords tout autour, dans un camel chaleureux.',
    t: { M: ['89 × 64 cm', 139.9], L: ['109 × 76 cm', 169.9], XL: ['119 × 84 cm', 199.9], XXL: ['132 × 102 cm', 239.9] } },
  { slug: 'panier-rectangle-fourrure', nom: 'Panier rectangle fourrure', couleur: 'Crème', cat: 'Paniers', f: ['grand'],
    court: 'Fausse fourrure douce et rebords moelleux, couleur crème.',
    long: 'Une fausse fourrure toute douce et des rebords moelleux, couleur crème, pour les chiens qui aiment le cocooning.',
    t: { M: ['89 × 64 cm', 139.9], L: ['102 × 71 cm', 169.9], XL: ['109 × 81 cm', 199.9], XXL: ['130 × 102 cm', 239.9] } },
  { slug: 'panier-rafraichissant', nom: 'Panier rafraîchissant', couleur: 'Bleu ciel et gris', cat: 'Rafraîchissant', badge: 'Nouveau', f: ['nouveau'],
    photos: ['/img/rafraichissant-1.webp', '/img/rafraichissant-2.webp'],
    court: 'Housse respirante qui garde ton chien au frais pendant l’été.',
    long: 'Une housse respirante bleu ciel qui garde ton chien au frais quand il fait chaud, sur une base grise en mousse à mémoire de forme avec rebords appui-tête.',
    t: { S: ['61 × 41 cm', 109.9], M: ['76 × 51 cm', 139.9], L: ['91 × 69 cm', 169.9], XL: ['114 × 89 cm', 199.9], XXL: ['135 × 107 cm', 239.9] } },
  { slug: 'panier-chenille', nom: 'Panier chenille', couleur: 'Brun chiné', cat: 'Paniers', f: ['nouveau'],
    court: 'Tissu chenille tout doux et passepoil crème.',
    long: 'Un tissu chenille brun chiné tout doux au toucher, souligné d’un passepoil crème, sur un couchage en mousse à mémoire de forme.',
    t: { S: ['61 × 41 cm', 109.9], M: ['76 × 51 cm', 139.9], L: ['91 × 69 cm', 169.9], XL: ['114 × 89 cm', 199.9], XXL: ['135 × 107 cm', 239.9] } },
];

export const euros = (n) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export const tailleDefaut = (p) => ('M' in p.t ? 'M' : Object.keys(p.t)[0]);
export const prixMin = (p) => Math.min(...Object.values(p.t).map((v) => v[1]));
