// Exercices et programmes d'entraînement d'Affûté.
// lieu : 'salle' (salle de sport), 'halteres' (maison avec haltères), 'corps' (sans matériel).
// Un exercice « salle » n'est proposé qu'en salle ; « halteres » en salle ou à la maison avec haltères ;
// « corps » partout.

export const MUSCLES = {
  pecs: 'Pectoraux', epaules: 'Épaules', triceps: 'Triceps', biceps: 'Biceps', avantbras: 'Avant-bras',
  abdos: 'Abdos', obliques: 'Obliques', dos: 'Dos (grand dorsal)', trapezes: 'Trapèzes', lombaires: 'Lombaires',
  fessiers: 'Fessiers', quadriceps: 'Quadriceps', ischios: 'Ischio-jambiers', mollets: 'Mollets', cardio: 'Cardio',
};

// type : 'poly' (plusieurs articulations, charges lourdes) ou 'iso' (un seul muscle) ; 'cardio' ; 'temps' (en secondes).
export const EXERCISES = [
  // ---------- Pectoraux ----------
  { id: 'dev-couche', nom: 'Développé couché à la barre', emoji: '🏋️', equip: 'salle', type: 'poly', muscles: ['pecs'], sec: ['triceps', 'epaules'],
    etapes: ['Allonge-toi sur le banc, les yeux sous la barre, pieds bien à plat au sol.', 'Saisis la barre un peu plus large que les épaules, omoplates serrées.', 'Descends la barre lentement jusqu\'au bas des pectoraux, puis pousse en soufflant.'],
    conseil: 'Garde les coudes à environ 45° du corps pour protéger tes épaules.', erreur: 'Rebondir la barre sur la poitrine ou décoller les fesses du banc.', alt: 'dev-couche-halteres' },
  { id: 'dev-couche-halteres', nom: 'Développé couché aux haltères', emoji: '🏋️', equip: 'halteres', type: 'poly', muscles: ['pecs'], sec: ['triceps', 'epaules'],
    etapes: ['Allonge-toi sur un banc (ou au sol) avec un haltère dans chaque main.', 'Pousse les haltères au-dessus de la poitrine, bras presque tendus.', 'Descends en écartant les coudes jusqu\'à sentir l\'étirement, puis remonte.'],
    conseil: 'Au sol, descends jusqu\'à ce que les coudes touchent le sol.', erreur: 'Descendre trop vite et perdre le contrôle des haltères.', alt: 'pompes' },
  { id: 'dev-incline-halteres', nom: 'Développé incliné aux haltères', emoji: '📐', equip: 'halteres', type: 'poly', muscles: ['pecs'], sec: ['epaules', 'triceps'],
    etapes: ['Règle le banc à 30°, un haltère dans chaque main.', 'Pousse vers le haut en rapprochant légèrement les haltères.', 'Redescends lentement jusqu\'au haut de la poitrine.'],
    conseil: 'Cible le haut des pectoraux : la partie qui se voit sous un t-shirt.', erreur: 'Incliner trop le banc (au-delà de 45°) : les épaules font tout le travail.', alt: 'pompes-pieds-sureleves' },
  { id: 'ecarte-poulie', nom: 'Écarté à la poulie', emoji: '🦋', equip: 'salle', type: 'iso', muscles: ['pecs'], sec: ['epaules'],
    etapes: ['Place les poulies en haut, une poignée dans chaque main, un pied en avant.', 'Bras légèrement fléchis, ramène les mains devant toi en arc de cercle.', 'Serre les pectoraux 1 seconde, puis reviens lentement.'],
    conseil: 'Imagine que tu fais un câlin à un arbre.', erreur: 'Plier les bras et transformer l\'exercice en développé.', alt: 'ecarte-halteres' },
  { id: 'ecarte-halteres', nom: 'Écarté aux haltères', emoji: '🦋', equip: 'halteres', type: 'iso', muscles: ['pecs'], sec: [],
    etapes: ['Allongé, haltères au-dessus de la poitrine, bras légèrement fléchis.', 'Écarte les bras en arc de cercle jusqu\'à sentir l\'étirement.', 'Remonte en serrant les pectoraux.'],
    conseil: 'Prends des haltères légers : c\'est la sensation qui compte.', erreur: 'Descendre trop bas avec des charges lourdes.', alt: 'pompes' },
  { id: 'pompes', nom: 'Pompes', emoji: '🤸', equip: 'corps', type: 'poly', muscles: ['pecs'], sec: ['triceps', 'epaules', 'abdos'],
    etapes: ['Mains au sol un peu plus larges que les épaules, corps bien droit de la tête aux talons.', 'Descends la poitrine jusqu\'à quelques centimètres du sol.', 'Pousse fort pour remonter, en soufflant.'],
    conseil: 'Trop dur ? Fais-les sur les genoux ou les mains sur une table.', erreur: 'Laisser le bassin tomber vers le sol.', alt: 'pompes-inclinees' },
  { id: 'pompes-inclinees', nom: 'Pompes mains surélevées', emoji: '🤸', equip: 'corps', type: 'poly', muscles: ['pecs'], sec: ['triceps', 'epaules'],
    etapes: ['Mains sur une table, un canapé ou un banc, corps droit.', 'Descends la poitrine vers le support.', 'Pousse pour remonter.'],
    conseil: 'Plus le support est haut, plus c\'est facile : idéal pour débuter.', erreur: 'Cambrer le bas du dos.', alt: 'pompes' },
  { id: 'pompes-pieds-sureleves', nom: 'Pompes pieds surélevés', emoji: '🤸', equip: 'corps', type: 'poly', muscles: ['pecs'], sec: ['epaules', 'triceps'],
    etapes: ['Pieds sur une chaise ou un lit, mains au sol.', 'Descends lentement la poitrine vers le sol.', 'Pousse pour remonter, corps gainé.'],
    conseil: 'Cible le haut des pectoraux, comme le développé incliné.', erreur: 'Plier les hanches.', alt: 'pompes' },
  { id: 'dips', nom: 'Dips', emoji: '🪜', equip: 'salle', type: 'poly', muscles: ['pecs', 'triceps'], sec: ['epaules'],
    etapes: ['En appui sur les barres parallèles, bras tendus.', 'Penche-toi légèrement en avant et descends jusqu\'à ce que les coudes soient à 90°.', 'Remonte en poussant sur les mains.'],
    conseil: 'Penché en avant = plus de pectoraux ; droit = plus de triceps.', erreur: 'Descendre trop bas si tu as mal aux épaules.', alt: 'dips-banc' },

  // ---------- Dos ----------
  { id: 'tractions', nom: 'Tractions', emoji: '🧗', equip: 'barre', type: 'poly', muscles: ['dos'], sec: ['biceps', 'avantbras'],
    etapes: ['Suspends-toi à une barre, mains un peu plus larges que les épaules.', 'Tire les coudes vers le bas jusqu\'à passer le menton au-dessus de la barre.', 'Redescends lentement jusqu\'aux bras tendus.'],
    conseil: 'Pas encore de traction ? Saute en haut et redescends le plus lentement possible (5 secondes).', erreur: 'Se balancer pour s\'aider.', alt: 'tirage-vertical', besoin: 'une barre de traction' },
  { id: 'tirage-vertical', nom: 'Tirage vertical (poulie haute)', emoji: '🧗', equip: 'salle', type: 'poly', muscles: ['dos'], sec: ['biceps'],
    etapes: ['Assis, cuisses bloquées, saisis la barre large.', 'Tire la barre vers le haut de la poitrine en sortant la poitrine.', 'Remonte lentement en contrôlant.'],
    conseil: 'Pense à tirer avec les coudes, pas avec les mains.', erreur: 'Tirer derrière la nuque.', alt: 'tractions' },
  { id: 'rowing-barre', nom: 'Rowing à la barre', emoji: '🚣', equip: 'salle', type: 'poly', muscles: ['dos'], sec: ['trapezes', 'biceps', 'lombaires'],
    etapes: ['Penche le buste à 45°, dos bien droit, genoux légèrement fléchis.', 'Tire la barre vers le nombril en serrant les omoplates.', 'Redescends lentement.'],
    conseil: 'Garde le dos plat comme une table.', erreur: 'Arrondir le dos ou se redresser à chaque répétition.', alt: 'rowing-haltere' },
  { id: 'rowing-haltere', nom: 'Rowing un bras à l\'haltère', emoji: '🚣', equip: 'halteres', type: 'poly', muscles: ['dos'], sec: ['biceps', 'trapezes'],
    etapes: ['Un genou et une main sur un banc (ou une chaise), dos plat.', 'Tire l\'haltère vers la hanche, coude près du corps.', 'Redescends en étirant bien le dos. Change de côté.'],
    conseil: 'Imagine que tu démarres une tondeuse à gazon.', erreur: 'Tourner le buste pour lever plus lourd.', alt: 'rowing-inverse' },
  { id: 'tirage-horizontal', nom: 'Tirage horizontal (poulie basse)', emoji: '🚣', equip: 'salle', type: 'poly', muscles: ['dos'], sec: ['trapezes', 'biceps'],
    etapes: ['Assis, pieds calés, dos droit, poignée en main.', 'Tire vers le ventre en serrant les omoplates.', 'Reviens en étirant les bras sans arrondir le dos.'],
    conseil: 'Bombe la poitrine en fin de mouvement.', erreur: 'Se pencher en arrière pour tirer plus lourd.', alt: 'rowing-haltere' },
  { id: 'rowing-inverse', nom: 'Rowing inversé sous une table', emoji: '🚣', equip: 'corps', type: 'poly', muscles: ['dos'], sec: ['biceps'],
    etapes: ['Allonge-toi sous une table solide, saisis le bord.', 'Corps droit, tire la poitrine vers la table.', 'Redescends lentement.'],
    conseil: 'Vérifie que la table est bien stable avant de commencer.', erreur: 'Laisser les hanches tomber.', alt: 'superman' },
  { id: 'souleve-terre', nom: 'Soulevé de terre', emoji: '🏋️', equip: 'salle', type: 'poly', muscles: ['dos', 'fessiers', 'ischios'], sec: ['lombaires', 'trapezes', 'avantbras'],
    etapes: ['Pieds sous la barre, saisis-la juste à l\'extérieur des jambes.', 'Dos plat, pousse dans le sol avec les jambes pour te redresser.', 'Redescends la barre le long des jambes, dos toujours plat.'],
    conseil: 'Commence léger et fais vérifier ta technique par un coach.', erreur: 'Arrondir le dos : risque de blessure.', alt: 'souleve-roumain' },
  { id: 'superman', nom: 'Superman (lombaires)', emoji: '🦸', equip: 'corps', type: 'iso', muscles: ['lombaires'], sec: ['fessiers'],
    etapes: ['Allongé sur le ventre, bras tendus devant.', 'Décolle en même temps bras, poitrine et jambes.', 'Tiens 2 secondes, puis redescends.'],
    conseil: 'Regarde le sol pour garder la nuque alignée.', erreur: 'Monter trop haut en forçant.', alt: 'rowing-inverse' },
  { id: 'face-pull', nom: 'Face pull', emoji: '🎯', equip: 'salle', type: 'iso', muscles: ['epaules', 'trapezes'], sec: [],
    etapes: ['Corde à la poulie haute, au niveau du visage.', 'Tire la corde vers ton front en écartant les mains.', 'Reviens lentement.'],
    conseil: 'Excellent pour la posture et la santé des épaules.', erreur: 'Tirer trop lourd en se penchant en arrière.', alt: 'oiseau' },
  { id: 'shrugs', nom: 'Haussements d\'épaules', emoji: '🤷', equip: 'halteres', type: 'iso', muscles: ['trapezes'], sec: [],
    etapes: ['Debout, un haltère dans chaque main, bras le long du corps.', 'Monte les épaules vers les oreilles.', 'Tiens 1 seconde, redescends.'],
    conseil: 'Ne fais pas rouler les épaules : monte et descends seulement.', erreur: 'Plier les bras.', alt: 'superman' },

  // ---------- Épaules ----------
  { id: 'dev-militaire', nom: 'Développé militaire', emoji: '🙌', equip: 'salle', type: 'poly', muscles: ['epaules'], sec: ['triceps', 'trapezes'],
    etapes: ['Debout, barre sur le haut de la poitrine, abdos serrés.', 'Pousse la barre au-dessus de la tête jusqu\'aux bras tendus.', 'Redescends lentement devant le visage.'],
    conseil: 'Serre les fessiers pour ne pas cambrer.', erreur: 'Cambrer fortement le bas du dos.', alt: 'dev-epaules-halteres' },
  { id: 'dev-epaules-halteres', nom: 'Développé épaules aux haltères', emoji: '🙌', equip: 'halteres', type: 'poly', muscles: ['epaules'], sec: ['triceps'],
    etapes: ['Assis, dos droit, haltères au niveau des épaules.', 'Pousse vers le haut sans cogner les haltères.', 'Redescends jusqu\'aux oreilles.'],
    conseil: 'Expire en poussant.', erreur: 'Descendre trop vite.', alt: 'pompes-pike' },
  { id: 'elevations-laterales', nom: 'Élévations latérales', emoji: '🪽', equip: 'halteres', type: 'iso', muscles: ['epaules'], sec: [],
    etapes: ['Debout, haltères le long du corps, coudes légèrement fléchis.', 'Monte les bras sur les côtés jusqu\'à hauteur des épaules.', 'Redescends lentement (2 secondes).'],
    conseil: 'L\'exercice n°1 pour des épaules larges. Léger et bien contrôlé.', erreur: 'Balancer le corps pour monter.', alt: 'elevations-laterales-bouteilles' },
  { id: 'elevations-laterales-bouteilles', nom: 'Élévations latérales (bouteilles d\'eau)', emoji: '🪽', equip: 'corps', type: 'iso', muscles: ['epaules'], sec: [],
    etapes: ['Une bouteille d\'eau pleine (1,5 L) dans chaque main.', 'Monte les bras sur les côtés jusqu\'à hauteur des épaules.', 'Redescends lentement.'],
    conseil: 'Fais des séries longues (15 à 20) : c\'est léger.', erreur: 'Hausser les épaules.', alt: 'pompes-pike' },
  { id: 'oiseau', nom: 'Oiseau (arrière d\'épaule)', emoji: '🐦', equip: 'halteres', type: 'iso', muscles: ['epaules'], sec: ['trapezes'],
    etapes: ['Penché en avant, dos plat, haltères sous la poitrine.', 'Écarte les bras sur les côtés comme des ailes.', 'Redescends lentement.'],
    conseil: 'Indispensable pour des épaules complètes et une belle posture.', erreur: 'Prendre trop lourd.', alt: 'superman' },
  { id: 'pompes-pike', nom: 'Pompes pike (épaules)', emoji: '🔺', equip: 'corps', type: 'poly', muscles: ['epaules'], sec: ['triceps'],
    etapes: ['Mains au sol, fesses en l\'air : ton corps forme un V inversé.', 'Descends la tête vers le sol entre les mains.', 'Pousse pour remonter.'],
    conseil: 'Pieds sur une chaise pour rendre l\'exercice plus difficile.', erreur: 'Descendre la poitrine au lieu de la tête.', alt: 'elevations-laterales-bouteilles' },

  // ---------- Biceps ----------
  { id: 'curl-barre', nom: 'Curl à la barre', emoji: '💪', equip: 'salle', type: 'iso', muscles: ['biceps'], sec: ['avantbras'],
    etapes: ['Debout, barre en mains paumes vers le haut, coudes collés au corps.', 'Monte la barre vers les épaules en pliant les coudes.', 'Redescends lentement jusqu\'aux bras tendus.'],
    conseil: 'La descente lente (3 secondes) fait autant travailler que la montée.', erreur: 'Balancer le dos pour monter la barre.', alt: 'curl-halteres' },
  { id: 'curl-halteres', nom: 'Curl aux haltères', emoji: '💪', equip: 'halteres', type: 'iso', muscles: ['biceps'], sec: ['avantbras'],
    etapes: ['Debout, haltères le long du corps, paumes vers l\'avant.', 'Monte les haltères en pliant les coudes, sans bouger les épaules.', 'Redescends lentement.'],
    conseil: 'Tourne le petit doigt vers le haut en fin de mouvement pour mieux contracter.', erreur: 'Avancer les coudes.', alt: 'curl-sac' },
  { id: 'curl-marteau', nom: 'Curl marteau', emoji: '🔨', equip: 'halteres', type: 'iso', muscles: ['biceps', 'avantbras'], sec: [],
    etapes: ['Haltères tenus comme des marteaux (paumes face à face).', 'Monte les haltères vers les épaules.', 'Redescends lentement.'],
    conseil: 'Épaissit le bras et l\'avant-bras.', erreur: 'Aller trop vite.', alt: 'curl-sac' },
  { id: 'curl-sac', nom: 'Curl avec un sac à dos chargé', emoji: '🎒', equip: 'corps', type: 'iso', muscles: ['biceps'], sec: ['avantbras'],
    etapes: ['Remplis un sac à dos (livres, bouteilles), tiens-le par la poignée.', 'Monte le sac vers la poitrine en pliant les coudes.', 'Redescends lentement.'],
    conseil: 'Ajoute un livre quand 15 répétitions deviennent faciles.', erreur: 'Se pencher en arrière.', alt: 'tractions' },
  { id: 'chin-ups', nom: 'Tractions supination (prise serrée)', emoji: '🧗', equip: 'barre', type: 'poly', muscles: ['biceps', 'dos'], sec: [],
    etapes: ['Suspends-toi paumes vers toi, mains écartées de la largeur des épaules.', 'Monte jusqu\'à passer le menton au-dessus de la barre.', 'Redescends lentement.'],
    conseil: 'La traction la plus facile pour commencer.', erreur: 'Ne pas tendre complètement les bras en bas.', alt: 'curl-sac', besoin: 'une barre de traction' },

  // ---------- Triceps ----------
  { id: 'barre-front', nom: 'Barre au front', emoji: '🎯', equip: 'salle', type: 'iso', muscles: ['triceps'], sec: [],
    etapes: ['Allongé sur un banc, barre au-dessus du visage, bras tendus.', 'Plie seulement les coudes pour descendre la barre vers le front.', 'Tends les bras pour remonter.'],
    conseil: 'Les coudes restent fixes et pointés vers le plafond.', erreur: 'Écarter les coudes.', alt: 'extension-nuque' },
  { id: 'extension-poulie', nom: 'Extension triceps à la poulie', emoji: '⬇️', equip: 'salle', type: 'iso', muscles: ['triceps'], sec: [],
    etapes: ['Face à la poulie haute, corde ou barre en mains, coudes collés au corps.', 'Pousse vers le bas jusqu\'aux bras tendus.', 'Remonte lentement jusqu\'à 90°.'],
    conseil: 'Écarte la corde en bas pour mieux contracter.', erreur: 'Décoller les coudes du corps.', alt: 'kickback' },
  { id: 'extension-nuque', nom: 'Extension nuque à l\'haltère', emoji: '⬆️', equip: 'halteres', type: 'iso', muscles: ['triceps'], sec: [],
    etapes: ['Assis, un haltère tenu à deux mains au-dessus de la tête.', 'Descends l\'haltère derrière la tête en pliant les coudes.', 'Tends les bras pour remonter.'],
    conseil: 'Travaille la longue portion du triceps : celle qui fait le volume du bras.', erreur: 'Écarter les coudes.', alt: 'dips-banc' },
  { id: 'kickback', nom: 'Kickback triceps', emoji: '↘️', equip: 'halteres', type: 'iso', muscles: ['triceps'], sec: [],
    etapes: ['Penché en avant, coude collé au corps et plié à 90°.', 'Tends le bras vers l\'arrière.', 'Reviens lentement.'],
    conseil: 'Tiens 1 seconde bras tendu.', erreur: 'Bouger l\'épaule.', alt: 'dips-banc' },
  { id: 'dips-banc', nom: 'Dips sur une chaise', emoji: '🪑', equip: 'corps', type: 'iso', muscles: ['triceps'], sec: ['pecs', 'epaules'],
    etapes: ['Mains sur le bord d\'une chaise stable, dos contre elle, jambes devant.', 'Plie les coudes pour descendre les fesses.', 'Pousse pour remonter.'],
    conseil: 'Jambes pliées = plus facile, jambes tendues = plus dur.', erreur: 'Descendre trop bas (douleur à l\'épaule).', alt: 'pompes-diamant' },
  { id: 'pompes-diamant', nom: 'Pompes diamant', emoji: '💎', equip: 'corps', type: 'poly', muscles: ['triceps'], sec: ['pecs'],
    etapes: ['Mains rapprochées sous la poitrine, pouces et index qui forment un losange.', 'Descends en gardant les coudes près du corps.', 'Pousse pour remonter.'],
    conseil: 'Sur les genoux si c\'est trop difficile.', erreur: 'Écarter les coudes.', alt: 'dips-banc' },

  // ---------- Jambes et fessiers ----------
  { id: 'squat', nom: 'Squat à la barre', emoji: '🏋️', equip: 'salle', type: 'poly', muscles: ['quadriceps', 'fessiers'], sec: ['ischios', 'lombaires', 'abdos'],
    etapes: ['Barre sur le haut du dos, pieds largeur des épaules.', 'Descends comme pour t\'asseoir, cuisses au moins parallèles au sol.', 'Pousse dans les talons pour remonter.'],
    conseil: 'Genoux dans l\'axe des pieds, poitrine sortie.', erreur: 'Laisser les genoux rentrer vers l\'intérieur.', alt: 'goblet-squat' },
  { id: 'goblet-squat', nom: 'Goblet squat', emoji: '🏆', equip: 'halteres', type: 'poly', muscles: ['quadriceps', 'fessiers'], sec: ['abdos'],
    etapes: ['Tiens un haltère contre la poitrine, comme une coupe.', 'Descends en gardant le buste droit.', 'Remonte en poussant dans les talons.'],
    conseil: 'Le meilleur squat pour apprendre la bonne technique.', erreur: 'Décoller les talons.', alt: 'squat-corps' },
  { id: 'presse', nom: 'Presse à cuisses', emoji: '🦵', equip: 'salle', type: 'poly', muscles: ['quadriceps', 'fessiers'], sec: ['ischios'],
    etapes: ['Assis dans la machine, pieds largeur des épaules sur la plateforme.', 'Descends en pliant les genoux jusqu\'à 90°.', 'Pousse sans verrouiller les genoux en haut.'],
    conseil: 'Pieds hauts = plus de fessiers ; pieds bas = plus de quadriceps.', erreur: 'Décoller le bas du dos du dossier.', alt: 'goblet-squat' },
  { id: 'squat-corps', nom: 'Squat au poids du corps', emoji: '🧎', equip: 'corps', type: 'poly', muscles: ['quadriceps', 'fessiers'], sec: [],
    etapes: ['Pieds largeur des épaules, bras devant pour l\'équilibre.', 'Descends le plus bas possible en gardant le dos droit.', 'Remonte.'],
    conseil: 'Trop facile ? Descends en 3 secondes ou fais des squats sautés.', erreur: 'Arrondir le dos en bas.', alt: 'fentes' },
  { id: 'fentes', nom: 'Fentes avant', emoji: '🚶', equip: 'corps', type: 'poly', muscles: ['quadriceps', 'fessiers'], sec: ['ischios'],
    etapes: ['Fais un grand pas en avant.', 'Descends jusqu\'à ce que le genou arrière frôle le sol.', 'Pousse sur la jambe avant pour revenir. Alterne.'],
    conseil: 'Prends des haltères ou des bouteilles en main pour progresser.', erreur: 'Genou avant qui dépasse beaucoup la pointe du pied.', alt: 'squat-corps' },
  { id: 'squat-bulgare', nom: 'Squat bulgare', emoji: '🪑', equip: 'corps', type: 'poly', muscles: ['quadriceps', 'fessiers'], sec: [],
    etapes: ['Pied arrière posé sur une chaise ou un banc.', 'Descends sur la jambe avant jusqu\'à 90°.', 'Remonte. Change de jambe.'],
    conseil: 'Très efficace même sans charge.', erreur: 'Pied avant trop proche de la chaise.', alt: 'fentes' },
  { id: 'souleve-roumain', nom: 'Soulevé de terre roumain', emoji: '🏋️', equip: 'halteres', type: 'poly', muscles: ['ischios', 'fessiers'], sec: ['lombaires'],
    etapes: ['Debout, haltères devant les cuisses, genoux légèrement fléchis.', 'Penche le buste en poussant les fesses en arrière, dos plat.', 'Remonte en serrant les fessiers.'],
    conseil: 'Descends jusqu\'à sentir l\'étirement derrière les cuisses.', erreur: 'Arrondir le dos.', alt: 'pont-fessier' },
  { id: 'leg-curl', nom: 'Leg curl (ischios)', emoji: '🦵', equip: 'salle', type: 'iso', muscles: ['ischios'], sec: [],
    etapes: ['Allongé ou assis dans la machine, boudin derrière les chevilles.', 'Plie les genoux en ramenant les talons vers les fesses.', 'Reviens lentement.'],
    conseil: 'Contrôle la descente.', erreur: 'Décoller les hanches.', alt: 'souleve-roumain' },
  { id: 'leg-extension', nom: 'Leg extension (quadriceps)', emoji: '🦵', equip: 'salle', type: 'iso', muscles: ['quadriceps'], sec: [],
    etapes: ['Assis dans la machine, boudin devant les chevilles.', 'Tends les jambes.', 'Redescends lentement.'],
    conseil: 'Tiens 1 seconde jambes tendues.', erreur: 'Donner un coup pour monter.', alt: 'squat-bulgare' },
  { id: 'hip-thrust', nom: 'Hip thrust', emoji: '🍑', equip: 'salle', type: 'poly', muscles: ['fessiers'], sec: ['ischios'],
    etapes: ['Haut du dos contre un banc, barre (avec protection) sur les hanches.', 'Pousse les hanches vers le haut en serrant les fessiers.', 'Redescends lentement.'],
    conseil: 'Le meilleur exercice pour les fessiers.', erreur: 'Cambrer le dos au lieu de monter avec les fessiers.', alt: 'pont-fessier' },
  { id: 'pont-fessier', nom: 'Pont fessier', emoji: '🍑', equip: 'corps', type: 'iso', muscles: ['fessiers'], sec: ['ischios'],
    etapes: ['Allongé sur le dos, genoux pliés, pieds au sol.', 'Monte les hanches en serrant fort les fessiers.', 'Tiens 2 secondes, redescends.'],
    conseil: 'Sur une seule jambe pour plus de difficulté.', erreur: 'Pousser avec le dos.', alt: 'hip-thrust' },
  { id: 'mollets', nom: 'Mollets debout', emoji: '🦶', equip: 'corps', type: 'iso', muscles: ['mollets'], sec: [],
    etapes: ['Debout sur une marche, talons dans le vide.', 'Monte sur la pointe des pieds le plus haut possible.', 'Redescends en étirant bien.'],
    conseil: 'Tiens un haltère ou un sac pour ajouter du poids.', erreur: 'Faire des rebonds rapides.', alt: 'mollets' },

  // ---------- Abdos ----------
  { id: 'gainage', nom: 'Gainage (planche)', emoji: '🧱', equip: 'corps', type: 'temps', muscles: ['abdos'], sec: ['obliques', 'lombaires'],
    etapes: ['En appui sur les avant-bras et les pointes de pieds.', 'Corps droit, serre les abdos et les fessiers.', 'Tiens la position en respirant normalement.'],
    conseil: 'Mieux vaut 30 secondes parfaites qu\'une minute le dos creusé.', erreur: 'Fesses trop hautes ou dos creusé.', alt: 'crunch' },
  { id: 'crunch', nom: 'Crunch', emoji: '🔥', equip: 'corps', type: 'iso', muscles: ['abdos'], sec: [],
    etapes: ['Allongé, genoux pliés, mains derrière la tête sans tirer.', 'Enroule le haut du dos en rapprochant les côtes du bassin.', 'Redescends lentement.'],
    conseil: 'Souffle en montant.', erreur: 'Tirer sur la nuque.', alt: 'gainage' },
  { id: 'releve-jambes', nom: 'Relevés de jambes', emoji: '🦵', equip: 'corps', type: 'iso', muscles: ['abdos'], sec: [],
    etapes: ['Allongé sur le dos, mains sous les fesses.', 'Monte les jambes tendues jusqu\'à la verticale.', 'Redescends sans toucher le sol.'],
    conseil: 'Plie les genoux si c\'est trop difficile.', erreur: 'Creuser le bas du dos.', alt: 'crunch' },
  { id: 'russian-twist', nom: 'Russian twist', emoji: '🌀', equip: 'corps', type: 'iso', muscles: ['obliques'], sec: ['abdos'],
    etapes: ['Assis, buste penché en arrière, pieds décollés (ou au sol).', 'Tourne le buste d\'un côté puis de l\'autre.', 'Touche le sol à côté de la hanche à chaque fois.'],
    conseil: 'Tiens une bouteille ou un haltère pour progresser.', erreur: 'Bouger seulement les bras.', alt: 'gainage-lateral' },
  { id: 'gainage-lateral', nom: 'Gainage latéral', emoji: '📏', equip: 'corps', type: 'temps', muscles: ['obliques'], sec: ['abdos'],
    etapes: ['Sur le côté, en appui sur un avant-bras.', 'Monte les hanches pour aligner le corps.', 'Tiens, puis change de côté.'],
    conseil: 'Affine la taille et protège le dos.', erreur: 'Laisser la hanche tomber.', alt: 'russian-twist' },
  { id: 'mountain-climbers', nom: 'Mountain climbers', emoji: '⛰️', equip: 'corps', type: 'temps', muscles: ['abdos', 'cardio'], sec: ['epaules'],
    etapes: ['En position de pompe, bras tendus.', 'Ramène un genou vers la poitrine, puis l\'autre, rapidement.', 'Garde les hanches basses.'],
    conseil: 'Abdos + cardio : parfait en sèche.', erreur: 'Monter les fesses.', alt: 'gainage' },

  // ---------- Cardio ----------
  { id: 'marche', nom: 'Marche rapide', emoji: '🚶', equip: 'corps', type: 'cardio', muscles: ['cardio'], sec: ['mollets'],
    etapes: ['Marche d\'un bon pas, assez vite pour être un peu essoufflé.', 'Garde le dos droit et balance les bras.', 'Vise 30 à 45 minutes.'],
    conseil: 'La meilleure activité en sèche : ça brûle sans donner faim.', erreur: 'Marcher trop lentement.', alt: 'velo' },
  { id: 'velo', nom: 'Vélo ou vélo d\'appartement', emoji: '🚴', equip: 'corps', type: 'cardio', muscles: ['cardio'], sec: ['quadriceps'],
    etapes: ['Pédale à une allure où tu peux encore parler.', 'Garde le dos droit.', 'Vise 20 à 40 minutes.'],
    conseil: 'Doux pour les genoux.', erreur: 'Selle trop basse.', alt: 'marche' },
  { id: 'hiit', nom: 'HIIT (fractionné)', emoji: '⚡', equip: 'corps', type: 'cardio', muscles: ['cardio'], sec: ['quadriceps', 'abdos'],
    etapes: ['Échauffe-toi 5 minutes.', 'Alterne 30 secondes à fond (sprint, burpees, jumping jacks) et 60 secondes calme.', 'Répète 8 à 10 fois.'],
    conseil: 'Pas plus de 2 fois par semaine : c\'est intense.', erreur: 'Sauter l\'échauffement.', alt: 'marche' },
  { id: 'corde', nom: 'Corde à sauter', emoji: '🪢', equip: 'corps', type: 'cardio', muscles: ['cardio'], sec: ['mollets'],
    etapes: ['Saute sur la pointe des pieds, poignets qui tournent.', '1 minute de corde, 30 secondes de pause.', 'Répète 10 fois.'],
    conseil: '10 minutes de corde = environ 30 minutes de jogging.', erreur: 'Sauter trop haut.', alt: 'hiit' },
];

export const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

// Séances types. Chaque créneau = liste d'exercices par ordre de préférence ;
// on prend le premier possible selon le lieu d'entraînement.
export const SESSIONS = {
  'pecs-triceps': { nom: 'Pectoraux et triceps', emoji: '🏋️', muscles: ['pecs', 'triceps'], slots: [
    ['dev-couche', 'dev-couche-halteres', 'pompes'], ['dev-incline-halteres', 'pompes-pieds-sureleves'], ['ecarte-poulie', 'ecarte-halteres', 'pompes-inclinees'],
    ['dips', 'dips-banc'], ['barre-front', 'extension-nuque', 'pompes-diamant'], ['extension-poulie', 'kickback', 'dips-banc']] },
  'dos-biceps': { nom: 'Dos et biceps', emoji: '🧗', muscles: ['dos', 'biceps'], slots: [
    ['tractions', 'tirage-vertical', 'rowing-inverse'], ['rowing-barre', 'rowing-haltere', 'rowing-inverse'], ['tirage-horizontal', 'rowing-haltere', 'superman'],
    ['face-pull', 'oiseau', 'superman'], ['curl-barre', 'curl-halteres', 'curl-sac'], ['curl-marteau', 'chin-ups', 'curl-sac']] },
  jambes: { nom: 'Jambes et fessiers', emoji: '🦵', muscles: ['quadriceps', 'fessiers', 'ischios', 'mollets'], slots: [
    ['squat', 'goblet-squat', 'squat-corps'], ['presse', 'squat-bulgare'], ['souleve-roumain', 'pont-fessier'], ['hip-thrust', 'pont-fessier'],
    ['leg-curl', 'fentes'], ['mollets']] },
  'epaules-abdos': { nom: 'Épaules et abdos', emoji: '🪽', muscles: ['epaules', 'trapezes', 'abdos'], slots: [
    ['dev-militaire', 'dev-epaules-halteres', 'pompes-pike'], ['elevations-laterales', 'elevations-laterales-bouteilles'], ['oiseau', 'face-pull', 'superman'],
    ['shrugs', 'superman'], ['gainage'], ['releve-jambes'], ['russian-twist']] },
  bras: { nom: 'Bras (biceps et triceps)', emoji: '💪', muscles: ['biceps', 'triceps', 'avantbras'], slots: [
    ['chin-ups', 'curl-barre', 'curl-sac'], ['barre-front', 'extension-nuque', 'pompes-diamant'], ['curl-halteres', 'curl-sac'],
    ['extension-poulie', 'kickback', 'dips-banc'], ['curl-marteau', 'curl-sac'], ['dips', 'dips-banc']] },
  push: { nom: 'Poussée (pecs, épaules, triceps)', emoji: '🏋️', muscles: ['pecs', 'epaules', 'triceps'], slots: [
    ['dev-couche', 'dev-couche-halteres', 'pompes'], ['dev-militaire', 'dev-epaules-halteres', 'pompes-pike'], ['dev-incline-halteres', 'pompes-pieds-sureleves'],
    ['elevations-laterales', 'elevations-laterales-bouteilles'], ['extension-poulie', 'extension-nuque', 'dips-banc'], ['pompes-diamant']] },
  pull: { nom: 'Tirage (dos, biceps)', emoji: '🧗', muscles: ['dos', 'biceps', 'trapezes'], slots: [
    ['tractions', 'tirage-vertical', 'rowing-inverse'], ['rowing-barre', 'rowing-haltere', 'rowing-inverse'], ['face-pull', 'oiseau', 'superman'],
    ['shrugs', 'superman'], ['curl-barre', 'curl-halteres', 'curl-sac'], ['curl-marteau', 'chin-ups']] },
  'haut-a': { nom: 'Haut du corps A', emoji: '🙌', muscles: ['pecs', 'dos', 'epaules', 'biceps', 'triceps'], slots: [
    ['dev-couche', 'dev-couche-halteres', 'pompes'], ['rowing-barre', 'rowing-haltere', 'rowing-inverse'], ['dev-epaules-halteres', 'pompes-pike'],
    ['tirage-vertical', 'tractions', 'superman'], ['curl-halteres', 'curl-sac'], ['extension-poulie', 'extension-nuque', 'dips-banc']] },
  'haut-b': { nom: 'Haut du corps B', emoji: '🙌', muscles: ['pecs', 'dos', 'epaules', 'biceps', 'triceps'], slots: [
    ['dev-incline-halteres', 'pompes-pieds-sureleves'], ['tractions', 'tirage-vertical', 'rowing-inverse'], ['dips', 'dips-banc'],
    ['tirage-horizontal', 'rowing-haltere', 'superman'], ['elevations-laterales', 'elevations-laterales-bouteilles'], ['curl-marteau', 'curl-sac']] },
  'bas-a': { nom: 'Bas du corps A', emoji: '🦵', muscles: ['quadriceps', 'fessiers', 'ischios', 'abdos'], slots: [
    ['squat', 'goblet-squat', 'squat-corps'], ['souleve-roumain', 'pont-fessier'], ['fentes'], ['leg-curl', 'pont-fessier'], ['mollets'], ['gainage']] },
  'bas-b': { nom: 'Bas du corps B', emoji: '🦵', muscles: ['quadriceps', 'fessiers', 'ischios', 'abdos'], slots: [
    ['souleve-terre', 'souleve-roumain', 'pont-fessier'], ['presse', 'squat-bulgare'], ['hip-thrust', 'pont-fessier'], ['leg-extension', 'squat-bulgare'],
    ['releve-jambes'], ['gainage-lateral']] },
  'full-a': { nom: 'Corps complet A', emoji: '🔥', muscles: ['quadriceps', 'pecs', 'dos', 'epaules', 'abdos'], slots: [
    ['squat', 'goblet-squat', 'squat-corps'], ['dev-couche', 'dev-couche-halteres', 'pompes'], ['rowing-barre', 'rowing-haltere', 'rowing-inverse'],
    ['dev-epaules-halteres', 'pompes-pike'], ['curl-halteres', 'curl-sac'], ['gainage']] },
  'full-b': { nom: 'Corps complet B', emoji: '🔥', muscles: ['ischios', 'fessiers', 'dos', 'pecs', 'abdos'], slots: [
    ['souleve-roumain', 'pont-fessier'], ['tractions', 'tirage-vertical', 'rowing-inverse'], ['dev-incline-halteres', 'pompes-pieds-sureleves'],
    ['fentes'], ['extension-nuque', 'dips-banc'], ['releve-jambes']] },
  cardio: { nom: 'Cardio et abdos', emoji: '🏃', muscles: ['cardio', 'abdos'], slots: [['marche', 'velo'], ['mountain-climbers'], ['gainage'], ['russian-twist']] },
  hiit: { nom: 'HIIT express', emoji: '⚡', muscles: ['cardio', 'abdos'], slots: [['hiit', 'corde'], ['mountain-climbers'], ['gainage-lateral']] },
};

// Planning type selon le nombre de séances par semaine (lundi → dimanche). 'repos' = jour off.
export const PROGRAMS = {
  3: { nom: 'Corps complet ×3', detail: 'Tout le corps 3 fois par semaine : idéal pour débuter.', jours: ['full-a', 'repos', 'full-b', 'repos', 'full-a', 'repos', 'repos'] },
  4: { nom: 'Haut / Bas ×2', detail: 'Haut du corps puis bas du corps, deux fois par semaine.', jours: ['haut-a', 'bas-a', 'repos', 'haut-b', 'bas-b', 'repos', 'repos'] },
  5: { nom: 'Un groupe par jour', detail: 'Chaque muscle a sa journée : pecs, dos, jambes, épaules, bras.', jours: ['pecs-triceps', 'dos-biceps', 'jambes', 'epaules-abdos', 'bras', 'repos', 'repos'] },
  6: { nom: 'Push / Pull / Legs ×2', detail: 'Poussée, tirage, jambes, deux fois par semaine : pour les confirmés.', jours: ['push', 'pull', 'jambes', 'push', 'pull', 'jambes', 'repos'] },
};

export const LIEUX = [
  { id: 'salle', label: 'En salle de sport', emoji: '🏟️', detail: 'Barres, machines, poulies' },
  { id: 'halteres', label: 'À la maison avec haltères', emoji: '🏠', detail: 'Une paire d\'haltères et une chaise' },
  { id: 'corps', label: 'Sans matériel', emoji: '🤸', detail: 'Poids du corps uniquement' },
];

export const NIVEAUX = [
  { id: 'debutant', label: 'Débutant', detail: 'Moins de 6 mois de musculation' },
  { id: 'intermediaire', label: 'Intermédiaire', detail: '6 mois à 2 ans' },
  { id: 'confirme', label: 'Confirmé', detail: 'Plus de 2 ans' },
];

const OK = { salle: ['salle', 'halteres', 'corps', 'barre'], halteres: ['halteres', 'corps'], corps: ['corps'] };
// « barre » = barre de traction : en salle, ou à la maison si la personne en a une.
export const available = (ex, lieu, barre = false) => OK[lieu || 'salle'].includes(ex.equip) || (ex.equip === 'barre' && barre);

// Séries, répétitions et repos selon l'objectif, le niveau et le type d'exercice.
export function prescription(ex, { objectif = 'seche', niveau = 'debutant' } = {}) {
  const masse = objectif === 'masse';
  const deb = niveau === 'debutant';
  if (ex.type === 'cardio') return { series: 1, reps: masse ? '20 min' : '30 à 40 min', min: null, max: null, repos: 0, cardio: true };
  if (ex.type === 'temps') return { series: deb ? 3 : 4, reps: deb ? '30 s' : '45 s', min: null, max: null, repos: 45, temps: true };
  if (ex.type === 'poly') {
    return masse
      ? { series: deb ? 3 : 4, reps: '6 à 10', min: 6, max: 10, repos: 120 }
      : { series: deb ? 3 : 4, reps: '8 à 12', min: 8, max: 12, repos: 90 };
  }
  return masse
    ? { series: 3, reps: '10 à 12', min: 10, max: 12, repos: 75 }
    : { series: 3, reps: '12 à 15', min: 12, max: 15, repos: 60 };
}

// Liste des exercices d'une séance pour un lieu donné.
export function sessionExercises(sessionId, lieu, barre = false) {
  const s = SESSIONS[sessionId];
  if (!s) return [];
  const seen = new Set();
  return s.slots.map((ids) => ids.map((i) => byId[i]).find((e) => e && available(e, lieu, barre) && !seen.has(e.id)))
    .filter(Boolean)
    .filter((e) => (seen.has(e.id) ? false : seen.add(e.id)));
}
