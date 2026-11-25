---
name: lire-le-web
description: Lire gratuitement des pages web avec Crawl4AI (alternative gratuite à Firecrawl) - fiches produits concurrentes, boutiques Shopify, pages fournisseurs, articles. Texte propre, exploration de plusieurs pages d'un site, questions sur une page. À utiliser avant Firecrawl pour économiser ses crédits.
---

# Lire le web gratuitement (Crawl4AI)

Crawl4AI est installé au démarrage de chaque session cloud (script de l'environnement « Default »).
Le script `lire.sh` de ce dossier l'installe aussi tout seul s'il manque.

## Commandes
- Une page en texte propre : `bash .claude/skills/lire-le-web/lire.sh URL`
- Seulement le contenu principal (sans menus) : `bash .claude/skills/lire-le-web/lire.sh URL -o md-fit`
- Plusieurs pages d'un site (ex. toute une boutique concurrente) : `bash .claude/skills/lire-le-web/lire.sh URL --deep-crawl bfs --max-pages 10 -o md-fit`
- Enregistrer dans un fichier : ajouter `-O fichier.md`
- Boutique Shopify : la liste des produits avec leurs prix est souvent lisible à `https://boutique.com/products.json` (lire avec `curl -s`).
- Capture d'écran d'un site : Playwright (déjà installé), `require('playwright')` en Node.

## Limites (dire à l'utilisateur, simplement)
1. **Réseau de la session cloud** : seuls les sites autorisés sont lisibles. Si un site est refusé
   (`request blocked` / `no rule allows host`), proposer d'ajouter ce site avec l'outil d'environnement
   (l'utilisateur valide sur son téléphone).
2. **Sites anti-robots** (Alibaba, Amazon, AliExpress…) : souvent bloqués. Utiliser alors le connecteur
   **Firecrawl** (payant en crédits), qui donne aussi des données toutes prêtes (prix fournisseurs Alibaba,
   meilleures ventes Amazon…).
3. Toujours essayer d'abord cet outil gratuit, puis Firecrawl seulement si ça bloque.
