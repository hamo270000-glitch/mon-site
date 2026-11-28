(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.remove('sans-js');
  const euros = (n) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  /* Menu téléphone */
  const tiroir = $('#tiroir');
  if (tiroir) {
    const ouvrir = () => { tiroir.classList.add('ouvert'); $('#burger').setAttribute('aria-expanded', 'true'); $('.ferme', tiroir).focus(); };
    const fermer = () => { tiroir.classList.remove('ouvert'); $('#burger').setAttribute('aria-expanded', 'false'); };
    $('#burger').addEventListener('click', ouvrir);
    $$('[data-ferme]', tiroir).forEach((e) => e.addEventListener('click', fermer));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });
  }

  /* Onglets de l'accueil */
  const onglets = $('#onglets');
  if (onglets) {
    onglets.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('button', onglets).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      $$('#grille .carte').forEach((c) => { c.hidden = !c.dataset.f.split(' ').includes(b.dataset.f); });
    });
  }

  /* Fiche produit : taille, prix, lien de pré-commande, photos */
  const fiche = $('#fiche-produit');
  if (fiche) {
    const tailles = JSON.parse(fiche.dataset.tailles);
    const races = JSON.parse(fiche.dataset.races);
    const slug = fiche.dataset.slug;
    const maj = (t) => {
      $$('.opts button', fiche).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
      $('#f-taille').textContent = t; $('#f-dim').textContent = tailles[t][0];
      $('#f-prix').textContent = euros(tailles[t][1]);
      $('#f-races').textContent = `Idéal pour : ${races[t]}`;
      $('#f-precommande').href = `/precommande?produit=${slug}&taille=${encodeURIComponent(t)}`;
    };
    $('.opts', fiche)?.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) maj(b.dataset.t); });
    $('.vignettes', fiche)?.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $('#grande').src = b.dataset.src;
      $$('.vignettes button', fiche).forEach((x) => x.setAttribute('aria-current', String(x === b)));
    });
  }

  /* Formulaires (pré-commande et contact) */
  const form = $('form[data-envoi]');
  if (form) {
    const cat = $('#catalogue') ? JSON.parse($('#catalogue').textContent) : null;
    const selP = $('#produit', form), selT = $('#taille', form), selQ = $('#quantite', form), recap = $('#recap');
    const remplirTailles = (garder) => {
      if (!cat || !selP) return;
      const p = cat[selP.value]; const avant = garder || selT.value;
      selT.innerHTML = Object.entries(p.t).map(([t, [d, prix]]) => `<option value="${t}">${t === 'Unique' ? 'Taille unique' : t} — ${d} — ${euros(prix)}</option>`).join('');
      if (avant && p.t[avant]) selT.value = avant; else selT.value = 'M' in p.t ? 'M' : Object.keys(p.t)[0];
      majRecap();
    };
    const majRecap = () => {
      if (!cat || !recap) return;
      const p = cat[selP.value]; const prix = p.t[selT.value][1]; const q = Number(selQ.value || 1);
      recap.innerHTML = `${p.nom} · ${selT.value === 'Unique' ? 'taille unique' : 'taille ' + selT.value} · ${q} × ${euros(prix)}<br><b>Total estimé : ${euros(prix * q)}</b> <span style="font-size:.85rem">— rien à payer aujourd’hui</span>`;
    };
    if (selP) {
      const q = new URLSearchParams(location.search);
      if (q.get('produit') && cat[q.get('produit')]) selP.value = q.get('produit');
      remplirTailles(q.get('taille'));
      selP.addEventListener('change', () => remplirTailles());
      selT.addEventListener('change', majRecap); selQ.addEventListener('change', majRecap);
    }

    const verifier = (champ) => {
      const bloc = champ.closest('.bloc'); if (!bloc) return true;
      const ok = champ.checkValidity(); bloc.classList.toggle('invalide', !ok);
      champ.setAttribute('aria-invalid', String(!ok)); return ok;
    };
    $$('input,select,textarea', form).forEach((c) => {
      c.addEventListener('blur', () => { if (c.value && c.type !== 'checkbox') verifier(c); });
      // Dès que le champ redevient correct, le message disparaît tout de suite (pas de saut de page au clic suivant).
      c.addEventListener(c.type === 'checkbox' || c.tagName === 'SELECT' ? 'change' : 'input', () => { if (c.closest('.invalide')) verifier(c); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const champs = $$('input,select,textarea', form).filter((c) => c.closest('.bloc'));
      const mauvais = champs.filter((c) => !verifier(c));
      const msg = $('.message-form', form); msg.className = 'message-form';
      if (mauvais.length) { mauvais[0].focus(); return; }
      const btn = $('button[type=submit]', form); const txt = btn.textContent;
      btn.disabled = true; btn.textContent = 'Envoi en cours…';
      try {
        const donnees = Object.fromEntries(new FormData(form));
        const r = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(donnees) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j.ok) throw new Error(j.erreur || 'Envoi impossible pour le moment.');
        location.href = j.redirection || '/merci';
      } catch (err) {
        msg.textContent = err.message + ' Réessaie dans un instant.'; msg.className = 'message-form erreur'; msg.focus();
        btn.disabled = false; btn.textContent = txt;
      }
    });
  }

  /* Apparition douce au défilement */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('vu'); io.unobserve(e.target); } }), { threshold: 0.1 });
    $$('[data-ap]').forEach((e) => io.observe(e));
  } else $$('[data-ap]').forEach((e) => e.classList.add('vu'));
})();
