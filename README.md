# Biovela Paris : thème Shopify

Thème Shopify « Online Store 2.0 » complet pour une marque de cosmétiques, en français et 100 % modifiable depuis l'éditeur Shopify.

```
theme/               ← le thème à téléverser dans Shopify (à zipper)
medias-produits/     ← photos retouchées + rendus 3D + vidéos produits
import-shopify/      ← fichier CSV des 8 produits, prêt à importer
```

## 1. Installer le thème

1. Zippez **le contenu** du dossier `theme/`. Les dossiers `layout`, `sections`… doivent être à la racine du zip.
   Sur Mac/Linux : `cd theme && zip -r ../biovela-theme.zip .`
2. Shopify Admin → **Boutique en ligne → Thèmes → Ajouter un thème → Importer un fichier zip**.
3. Cliquez sur **Personnaliser** pour tout modifier : textes, images, couleurs et ordre des sections.

> Autre méthode, avec Shopify CLI : `cd theme && shopify theme push --unpublished`

## 2. Créer les métachamps (avant l'import des produits)

Shopify Admin → **Paramètres → Données personnalisées → Produits → Ajouter une définition** :

| Nom | Espace de noms et clé | Type |
|---|---|---|
| Sous-titre | `custom.subtitle` | Texte sur une ligne |
| Format | `custom.volume` | Texte sur une ligne |
| Description courte | `custom.short_description` | Texte multiligne |
| Bénéfices | `custom.benefits` | Texte multiligne (1 bénéfice par ligne) |
| Types de peau | `custom.skin_types` | Texte multiligne (1 par ligne) |
| Actifs clés | `custom.key_ingredients` | Texte multiligne |
| INCI | `custom.inci` | Texte multiligne |
| Mode d'emploi | `custom.how_to_use` | Texte multiligne |
| Besoins | `custom.concerns` | Texte multiligne (1 par ligne) |
| Utilisation | `custom.usage` | Texte sur une ligne (ex : Matin et soir) |
| Gamme (petit titre au-dessus du nom) | `custom.range` | Texte sur une ligne |
| Produits complémentaires | `custom.complementary` | Référence produit (liste) |

## 3. Importer les produits

Produits → **Importer** → `import-shopify/produits-biovela.csv`. Les prix, prix barrés, stock (100), SEO et métachamps sont déjà remplis.

Ajoutez ensuite les photos et vidéos dans chaque fiche produit (glisser-déposer depuis `medias-produits/`) :

| Produit | Médias |
|---|---|
| Brosse lymphatique visage | `brosse-lymphatique-2.jpg` (principale), `-1`, `-geste`, `-3` |
| Sérum Éclat Vitamine C | `serum-vitamine-c*.jpg` + `serum-turntable.mp4` |
| Crème Hydratante | `creme-hydratante*.jpg` + `creme-turntable.mp4` |
| Huile Visage Précieuse | `huile-visage*.jpg` |
| Contour des Yeux | `contour-yeux*.jpg` |
| Gel Nettoyant | `gel-nettoyant*.jpg` |
| Gua Sha | `gua-sha*.jpg` |
| Coffret Routine | `coffret-routine.jpg` |

Remplissez enfin le métachamp **Produits complémentaires** pour afficher le bloc « Complétez votre rituel ». Par exemple : brosse → huile + sérum.

## 4. Collections et menus

- Créez une collection automatique **Tous nos soins**, puis sélectionnez-la dans la section « Collection en vedette » de la page d'accueil.
- **Méga-menu** (Boutique en ligne → Navigation → `main-menu`) : il utilise 3 niveaux, glissés les uns sous les autres.
  - Niveau 1 = onglet (ex. **Soins visage**).
  - Niveau 2 = titre de colonne (ex. *Par besoin*, *Par type de soin*, *Par type de peau*).
  - Niveau 3 = liens (ex. *Éclat*, *Sérums*, *Peau sèche*).
  - Les visuels produits à droite du menu se règlent dans Personnaliser → En-tête → « Visuel du méga-menu » : indiquez le titre exact de l'onglet, une image, un titre et un lien. Six visuels sont déjà prêts (Soins visage, Outils, Rituels).
- Autres menus : `footer`, `aide` et `legal`.
- Filtres de collection : installez l'application gratuite **Shopify Search & Discovery**, puis ajoutez les filtres Prix, Type de produit et Tags (les tags `peau-…` et `besoin-…` sont déjà dans le CSV).
- Pages : créez « À propos » avec le modèle `page.a-propos` et « Contact » avec le modèle `page.contact`.

## 5. Avis clients (important)

Le thème affiche automatiquement les **étoiles et le nombre d'avis** (cartes produits, fiche produit, données Google) dès qu'une application d'avis est installée : **Judge.me** (gratuit), Shopify Product Reviews, Avis Vérifiés ou Okendo.
- Ajoutez le bloc de l'application dans la fiche produit : Personnaliser → Produit → Ajouter un bloc → Applications.
- La section « Vos avis » de l'accueil contient 3 avis **d'exemple**, marqués « Exemple ». Remplacez-les par de vrais avis clients, puis décochez « Afficher le libellé Exemple ».
- ⚠️ En France et dans l'UE, publier de faux avis ou des chiffres de résultats inventés est interdit (DGCCRF, directive Omnibus). N'affichez que des avis et des études réels.

## 6. À vérifier avant la mise en ligne

- **Paiement en 3x** : activez réellement Klarna, Alma ou PayPal 4x, ou désactivez l'option dans le bloc Prix.
- **Livraison offerte** : le seuil (49 € par défaut) se règle dans Paramètres du thème → Panier, et doit correspondre à vos tarifs d'expédition.
- **INCI** : faites valider les listes par votre fabricant ou formulateur. Les valeurs `[À COMPLÉTER]` / `[À CONFIRMER]` doivent être remplacées.
- **Vidéos de la page d'accueil** : par défaut, le thème lit `hero-video.mp4` dans ses assets. Si Shopify refuse ce fichier, téléversez-le dans Contenu → Fichiers, puis choisissez-le dans le champ « Vidéo (Shopify) » de la section.
- Mentions légales, CGV, politique de confidentialité (Paramètres → Politiques), puis bannière cookies (application gratuite « Customer Privacy »).

## 7. Vidéos clientes et avis avec photos (ce qui fait vendre)

- **Vidéos clientes** (accueil + fiche produit) : Personnaliser → section « Vidéos clientes ». Pour chaque bloc, choisissez une **vraie vidéo verticale** (format 9:16, MP4) d'une cliente ou d'une créatrice qui utilise la brosse, avec son accord. Décochez ensuite « Afficher Exemple ».
  Pour en obtenir : envoyez la brosse à 5–10 micro-créatrices (TikTok/Instagram) ou passez par une plateforme d'UGC, et demandez à vos premières clientes une vidéo contre un code promo.
- **Avis avec photos** (bas de la fiche produit) : section « Avis produit ». Installez Judge.me et ajoutez son bloc dans cette section : les avis, photos et vidéos clients s'afficheront automatiquement, ainsi que la vraie note.
- Les visuels actuels de ces deux sections sont des **exemples marqués « Exemple »** : remplacez-les par du contenu réel. N'inventez jamais d'avis ou de témoignages : c'est interdit, et les clientes le sentent.

## Fonctionnalités incluses

- Barre d'annonce défilante, en-tête collant, menu mobile, recherche, compte client.
- Bannière principale avec image ou vidéo, réassurance (livraison, marque française, cruelty-free, paiement).
- Best-sellers avec badges (-X %, Best-seller, Nouveau), 2e photo au survol, ajout rapide au panier.
- Produit phare, vidéo plein écran, routine en 4 étapes, actifs clés, **diagnostic de peau interactif**.
- Avis clients, engagements, galerie Instagram, FAQ (avec données structurées Google), newsletter -10 %.
- **Fiche produit** :
  - galerie photos et vidéos avec zoom et balayage sur mobile ;
  - étoiles, prix barré et % de remise, paiement en 3x ;
  - types de peau, bénéfices, stock en temps réel, date de livraison estimée ;
  - « Complétez votre rituel », onglets Description / Actifs / Mode d'emploi / INCI / Livraison ;
  - barre d'achat collante, Shop Pay / Apple Pay, données structurées Produit.
- **Collection** : filtres, tri, pagination.
- **Panier** : tiroir latéral avec barre de progression « livraison offerte », page panier et note de commande.
- Pages À propos, Contact, Blog / Journal, Recherche, 404, Carte cadeau et page Mot de passe.
- Responsive mobile, animations douces, accessibilité (navigation clavier, mouvement réduit).
