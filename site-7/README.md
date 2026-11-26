# Site 7 · Sieste (démo)

Site de démonstration : boutique de **paniers orthopédiques pour chien**, marque inventée « Sieste ».
Marque, prix et avis sont **inventés** (un bandeau le dit en haut de la page).

En ligne : https://hamo270000-glitch.github.io/mon-site/site-7/

## Design
Reproduit le design Dribbble n°10 **choisi par l'utilisateur** : « PetCare – Pet Store Ecommerce Website for Dog Lovers » (marque Barkzen) de Sohanur Rahman
(https://dribbble.com/shots/27399564-PetCare-Pet-Store-Ecommerce-Website-for-Dog-Lovers).
- Fond blanc, **orange #f26a21** comme seule couleur d'accent, police **Poppins** (dans `fonts/`).
- **Catalogue réel** (tableau de prix de l'utilisateur) : Canapé à rebords, Canapé bas, Canapé 3 rebords, Canapé carré (L/XL/XXL), Lit taille humaine (taille unique 219,90 €), Panier ovale (M→XXL), Panier rectangle (M→XXL), Panier rafraîchissant, Panier chenille. Prix de vente : S 109,90 € · M 139,90 € · L 169,90 € · XL 199,90 € · XXL 239,90 €. Dimensions propres à chaque produit (voir `PANIERS` dans `index.html`). Les coûts usine ne sont pas affichés sur le site.
- Photos produit (fond blanc) dans `img/produits/`, découpées depuis le tableau de l'utilisateur sans les noms de couleur ; photos d'ambiance dans `img/gamme/` (affichées au survol sur ordinateur et dans les autres sections).
- Héros : grande photo, texte blanc à gauche, étoiles + nombre d'avis, bouton orange « Acheter » ; 3 photos qui défilent toutes seules.
- Sur iPhone, les produits s’affichent un par ligne comme sur Amazon (photo à gauche, nom, étoiles, tailles, prix et bouton orange à droite) ; sur ordinateur, grille de 3.
- Bande de réassurance, « Découvrez nos paniers » (cartes gris clair, étoiles, choix de taille, prix orange, bouton noir « Acheter »), engagements autour d'une photo, « Pourquoi choisir Sieste » (3 cartes photo), tableau « La différence est claire », témoignages, bandeau final orange.
- Refusé avant : noir et or, vert et terracotta, arches façon tubik.

## Fichiers
Une seule page `index.html` (HTML + CSS + JS), sans étape de construction. GSAP, ScrollTrigger et Lenis dans `vendor/`. Photos : `img/produits/` (photos produit) et `img/gamme/` (photos d’ambiance OpenArt fournies par l’utilisateur, découpées sans les noms ni le logo).
