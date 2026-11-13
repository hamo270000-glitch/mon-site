# Consignes pour Claude

## L'utilisateur
- Il débute en code et parle français : réponds toujours en français, simplement, avec des étapes numérotées et sans jargon.
- Il utilise un iPhone (app Claude et Safari).

## Façon de travailler
1. Après chaque modification : commit, puis push sur une branche `claude/...` (jamais directement sur `main`).
2. Ouvre une pull request.
3. **Fusionne toi-même la pull request** une fois les tests réussis (autorisation permanente donnée par l'utilisateur le 4 novembre 2026). Il n'a plus besoin d'appuyer sur « Merge ».
4. Vérifie ensuite que le site en ligne (GitHub Pages, branche `main`) a bien la nouvelle version, et dis-lui de fermer puis rouvrir Safari.

## Les projets
- `affute/` : Affûté, l'appli de sèche et de prise de masse (voir `affute/README.md`). En ligne sur https://hamo270000-glitch.github.io/mon-site/affute/
- Racine (`index.html`, `js/`, `css/`) : Clair, le scanner alimentaire (voir `README.md`). En ligne sur https://hamo270000-glitch.github.io/mon-site/
- `site-2/` : Site 2, boutique de cosmétiques « Rosée », en React + React Bits + GSAP + Lenis (voir `site-2/README.md`). En ligne sur https://hamo270000-glitch.github.io/mon-site/site-2/
  - On modifie le code dans `site-2/source/`, puis on lance `npm run build` dans ce dossier avant le commit (le site construit est publié tel quel).
- `site-3/` : Site 3, nouveau projet (contenu à choisir), même base que le Site 2 (voir `site-3/README.md`). En ligne sur https://hamo270000-glitch.github.io/mon-site/site-3/
  - Code dans `site-3/source/`, puis `npm run build` dans ce dossier avant le commit.
- `.claude/agents/` : agents de The Agency.
- `.claude/skills/` : skills installés (GSAP, frontend-design, react-best-practices, web-design-guidelines, composition-patterns, find-skills). Utilise-les pour le Site 2 et le Site 3.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
