# Clair – Scanner santé

Application web (installable sur téléphone) qui scanne les produits alimentaires et donne une note **personnalisée**.

## Fonctionnalités
1. **Note personnalisée** selon le profil : allergies, diabète, tension, cholestérol, grossesse, objectif (perte de poids, sport).
2. **Mieux et moins cher** : alternatives de la même catégorie, mieux notées, de préférence dans le magasin habituel, avec les prix connus.
3. **Mode parents** : le sucre affiché en morceaux et en % du maximum conseillé pour un enfant.
4. **Compléments alimentaires** : doses par rapport aux besoins, limites de sécurité, interactions possibles avec les médicaments.
5. **Halal, végétarien, végan, sans lactose** : analyse des ingrédients et des additifs d'origine animale.

Le profil et l'historique restent sur le téléphone (localStorage).

## Données
- [Open Food Facts](https://world.openfoodfacts.org) : produits, ingrédients, nutrition (licence ODbL).
- [Open Prices](https://prices.openfoodfacts.org) : prix relevés par la communauté.
- Scanner de code-barres : [html5-qrcode](https://github.com/mebjas/html5-qrcode) (Apache 2.0), dans `vendor/`.

## Lancer en local
```
python3 -m http.server 8000
```
Puis ouvrir http://localhost:8000. La caméra demande HTTPS (ou localhost).

## Mettre en ligne (gratuit)
GitHub → Settings → Pages → Source : « Deploy from a branch », branche `main`, dossier `/ (root)`.

## Organisation du code
- `js/data.js` : listes de référence (allergènes, additifs, vitamines, interactions).
- `js/score.js` : calcul de la note et des alertes (sans dépendance au navigateur).
- `js/api.js` : appels Open Food Facts et Open Prices.
- `js/app.js` : écrans de l'application.

> Clair donne des informations générales, pas un avis médical.
