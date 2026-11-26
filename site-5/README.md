# Site 5 · Truffe, boutique pour chiens

Vraie boutique e-commerce pour chiens : 10 produits en 4 rayons (Dormir, Repas, Balade, Jeux), produit phare le panier orthopédique « Nuage » (89 à 149 €).

Pages : accueil (carrousel, rayons, favoris, produit phare, réassurance, FAQ, inscription), collection avec filtres et tri, recherche, fiche produit (galerie, tailles, coloris, quantité, onglets), panier, aide et pages légales (à compléter).

En ligne : https://hamo270000-glitch.github.io/mon-site/site-5/

## Comment c'est fait
- React + Vite + Tailwind 4, GSAP (ScrollTrigger, SplitText), Lenis, Motion.
- Design choisi avec le skill `ui-ux-pro-max` (style « Vibrant & Block-based », vert forêt + abricot, polices Rubik + Nunito Sans).
- Deux pièces adaptées de **21st.dev** : le vol du produit vers le panier (« Add to basket », exemples Motion) et le bouton qui s'enfonce puis passe au vert (« Add to Cart Button »). Voir `source/src/ui/Ajouter.tsx`.
- Style sobre et pro (l'utilisateur a refusé la première version « dessin animé » avec mascotte).
- Photos : emplacements « Photo à venir » (`source/src/ui/Visuel.tsx`). Pour mettre une vraie photo, donner `src` au composant `Visuel`, ou ajouter les chemins dans `data.ts`.
- Concurrents regardés : Zooplus (coussin orthopédique ~199 €), Maison Moulin (panier classique ~71 €). Positionnement : orthopédique de qualité, entre les deux.

## À faire avant d'ouvrir
- Ajouter les vraies photos (l'utilisateur les fera plus tard).
- Compléter les pages légales (CGV, mentions légales, confidentialité) et le contact.
- Confirmer prix, délais et frais de livraison avec le fournisseur.
- Brancher le paiement (bouton désactivé pour l'instant).

## Modifier
Code dans `site-5/source/`, puis `npm run build` dans ce dossier avant le commit.
