# Site 5 · Truffe, boutique pour chiens

Boutique animalière « vivante » : paniers orthopédiques (produit star « panier Nuage », 89 à 149 €), tapis de voyage, gamelle anti-glouton, harnais, balle à friandises, plaid.

En ligne : https://hamo270000-glitch.github.io/mon-site/site-5/

## Comment c'est fait
- React + Vite + Tailwind 4, GSAP (ScrollTrigger, SplitText), Lenis, Motion.
- Design choisi avec le skill `ui-ux-pro-max` (style « Vibrant & Block-based », vert forêt + abricot, polices Rubik + Nunito Sans).
- Deux pièces adaptées de **21st.dev** : le vol du produit vers le panier (« Add to basket », exemples Motion) et le bouton qui s'enfonce puis passe au vert (« Add to Cart Button »). Voir `source/src/ui/Ajouter.tsx`.
- Pas de 3D calculée en direct (leçon du Site 6) : tout est en SVG animé, léger sur iPhone.
- Biscuit, la mascotte (`source/src/ui/Mascotte.tsx`) : respire, cligne, remue la queue, suit le doigt du regard.
- Concurrents regardés : Zooplus (coussin orthopédique ~199 €), Maison Moulin (panier classique ~71 €). Positionnement : orthopédique de qualité, entre les deux.

## À faire avant d'ouvrir
- Remplacer les illustrations par les vraies photos (échantillon fournisseur).
- Confirmer prix, délais et frais de livraison avec le fournisseur.
- Brancher le paiement (bouton désactivé pour l'instant).

## Modifier
Code dans `site-5/source/`, puis `npm run build` dans ce dossier avant le commit.
