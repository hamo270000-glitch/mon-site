#!/bin/bash
# Lit une page web avec Crawl4AI (gratuit) et l'affiche en texte propre (markdown).
# Usage : bash lire.sh URL [options crwl]   ex. : bash lire.sh https://site.fr/produit -o md-fit
export PATH="$HOME/.local/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
export CRAWL4AI_NO_CLOUD_NOTICE=1
if ! command -v crwl >/dev/null 2>&1; then
  PWV=$(cd /tmp && NODE_PATH=$(npm root -g) node -e "console.log(require('playwright/package.json').version)" 2>/dev/null)
  uv tool install crawl4ai ${PWV:+--with playwright==$PWV} >/dev/null 2>&1
fi
url="$1"; shift
if [ $# -eq 0 ]; then set -- -o markdown; fi
exec crwl crawl "$url" "$@"
