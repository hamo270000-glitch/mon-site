# Site 10 — « nidou »

Boutique de démonstration de paniers orthopédiques pour chien, faite à partir de la vidéo du thème Shopify « Glozin » (version animaux) envoyée par l'utilisateur le 28 novembre 2026.
- Couleurs : bandeau violet `#6b2ee0`, héros indigo `#2b2470`, bloc vert `#3f5849`, fonds gris clair `#f3f3f3` pour les produits, boutons pilule noirs et blancs, bouton « Acheter maintenant » corail.
- Police : **Instrument Sans** (hébergée dans `fonts/`).
- Accueil : bandeau qui défile, héros en diaporama (3 photos), catégories en photos, onglets « Meilleures ventes / Nouveautés / Grands chiens », bloc vert « Lit taille humaine », guide des tailles (à la place des faux avis), bannière photo, 3 atouts, pied de page avec newsletter et moyens de paiement.
- Fiche produit `#/produit/<id>` comme Glozin : miniatures, tailles, quantité, Ajouter au panier, favoris, Acheter maintenant, livraison/retours, paiement sécurisé, onglets.
- Pas de fausse urgence (« 35 personnes regardent », « plus que 10 en stock »), ni faux avis, ni faux prix barrés.
- Mêmes 9 produits et prix que les Sites 7, 8 et 9. Une seule page `index.html`, sans construction. Vitrine seulement (pas de paiement).

## Version sans photos (28 novembre 2026)
À la demande de l'utilisateur, le site s'affiche **sans aucune photo** : chaque image est remplacée par un emplacement « Photo à venir » (script en bas de `index.html`, bloc « Version sans photos »). Les chemins des photos restent dans le code (`data-src`, `img:`/`amb:` des produits). Pour remettre les photos : supprimer ce bloc CSS et JS et remplacer `data-src=` par `src=`.

Exception : la grande photo du haut (`img/heros-samoyede.jpg`, Samoyède sur le panier rafraîchissant, envoyée par l'utilisateur) est affichée.
Sur téléphone, la bannière affiche `img/heros-samoyede-mobile.jpg` (chien centré) sous le texte ; sur ordinateur, `img/heros-samoyede.jpg` à droite du texte.

## Couleurs beige et caramel + héros plein écran (28 novembre 2026)
L'utilisateur a choisi la palette n°3 « Beige et caramel » : bandeau et accents caramel `#b8743d`, brun foncé `#2e2420` (en-tête, héros, boutons), brun moyen `#6e4a33` (bloc lit géant, badges), beige `#f5efe7` (fonds produits), fond de page `#fffcf8`. La bannière du haut occupe tout l'écran (photo du Samoyède ; sur téléphone, photo en haut et texte en dessous sur fond brun).
