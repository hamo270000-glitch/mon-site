# Site 7 · sieste (démo)

Site de démonstration : boutique de **paniers orthopédiques pour chien**, marque inventée (« sieste »).
Marque, prix et avis sont **inventés** (un bandeau le dit en haut de la page).

En ligne : https://hamo270000-glitch.github.io/mon-site/site-7/

## Direction artistique
Inspirée des designs « pet store » les plus aimés de Dribbble (tubik : 555 likes, Nixtio : 395 likes), après que l'utilisateur a refusé les versions « noir et or » puis « vert et terracotta » qui faisaient trop dropshipping :
- photos dans des **arches** (arrondies en haut), contour doré et trait courbe qui se dessine ;
- titres en **Fraunces** (serif éditoriale, italique), texte en DM Sans (polices dans `fonts/`) ;
- couleurs : sapin #2d5a54, lavande #cdc6ef, citron #d9f27e, crème #f5f1e8 ;
- badge rond « Nouvelle collection » qui tourne, pilule « Taille S—XL », beaucoup d'air, peu de badges promo.
- Le fond blanc/gris des photos fournisseur se fond dans la couleur de l'arche (`mix-blend-mode: multiply` + léger éclaircissement).

## Animations (GSAP + Lenis, dans `vendor/`)
Grande arche avec 3 photos qui défilent seules, titres mot par mot (SplitText), phrase qui s'allume au défilement, 4 couches en défilement horizontal épinglé, prix qui comptent au changement de taille, patte qui vole jusqu'au panier, menu plein écran qui s'ouvre en cercle, avis un par un.

## Fichiers
Une seule page `index.html` (HTML + CSS + JS), sans étape de construction. Photos du fournisseur dans `img/` (copiées depuis le Site 6).
