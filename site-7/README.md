# Site 7 · Sieste (démo)

Site de démonstration : boutique de **paniers orthopédiques pour chien**, marque inventée « Sieste ».
Marque, prix et avis sont **inventés** (un bandeau le dit en haut de la page).

En ligne : https://hamo270000-glitch.github.io/mon-site/site-7/

## Design
Reproduit le design Dribbble n°10 **choisi par l'utilisateur** : « PetCare – Pet Store Ecommerce Website for Dog Lovers » (marque Barkzen) de Sohanur Rahman
(https://dribbble.com/shots/27399564-PetCare-Pet-Store-Ecommerce-Website-for-Dog-Lovers).
- Fond blanc, **orange #f26a21** comme seule couleur d'accent, police **Poppins** (dans `fonts/`).
- 9 paniers, un par photo (Classique, Fraîcheur, Cocon, Ovale, Grand Repos, Tweed, Peluche, Urbain, Marine).
- Héros : grande photo, texte blanc à gauche, étoiles + nombre d'avis, bouton orange « Acheter » ; 3 photos qui défilent toutes seules.
- Bande de réassurance, « Découvrez nos paniers » (cartes gris clair, étoiles, choix de taille, prix orange, bouton noir « Acheter »), engagements autour d'une photo, « Pourquoi choisir Sieste » (3 cartes photo), tableau « La différence est claire », témoignages, bandeau final orange.
- Refusé avant : noir et or, vert et terracotta, arches façon tubik.

## Fichiers
Une seule page `index.html` (HTML + CSS + JS), sans étape de construction. GSAP, ScrollTrigger et Lenis dans `vendor/`. Photos : `img/gamme/`, 9 photos d’ambiance fournies par l’utilisateur (planche OpenArt), découpées une par produit sans les noms de couleur ni le logo OpenArt.
