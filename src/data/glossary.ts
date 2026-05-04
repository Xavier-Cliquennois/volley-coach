export type GlossaryTerm = {
  slug: string;
  label: string;
  aliases: string[];
  definition: string;
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'rpe',
    label: 'RPE',
    aliases: ['RPE'],
    definition:
      "Rate of Perceived Exertion. Echelle 1-10 de difficulte ressentie. RPE 7 = 3 reps en reserve, RPE 9 = 1 rep en reserve, RPE 10 = echec total.",
  },
  {
    slug: '1rm',
    label: '1RM',
    aliases: ['1RM'],
    definition:
      "One Rep Max. Charge maximale soulevable en 1 repetition. Reference pour les % d'intensite. S'estime via une serie de 5-8 reps a RPE 8-9.",
  },
  {
    slug: 'cmj',
    label: 'CMJ',
    aliases: ['CMJ'],
    definition:
      "Counter Movement Jump. Saut vertical avec flexion prealable (elan). Mesure de reference de la detente verticale. Mesurable avec l'app My Jump 2.",
  },
  {
    slug: 'plyo',
    label: 'Plyometrie',
    aliases: ['Plyo', 'Plyometrie', 'plyometrie', 'plyometrique'],
    definition:
      "Entrainement base sur le cycle etirement-raccourcissement. Le muscle absorbe une force et la restitue immediatement (rebond). Developpe la puissance explosive.",
  },
  {
    slug: 'methode-3-7',
    label: 'Methode 3/7',
    aliases: ['3/7', 'Methode 3/7', 'methode 3/7'],
    definition:
      "Protocole ULB. 5 mini-series de 3-4-5-6-7 reps avec 15s de repos entre chaque, charge ~70% 1RM. Puis 2min30 avant la sequence suivante. Prouve 2x plus efficace que les series classiques.",
  },
  {
    slug: 'fcm',
    label: 'FCM',
    aliases: ['FCM', 'French Contrast Method'],
    definition:
      "French Contrast Method. Phase 3. Enchaine: exercice lourd > plyometrie explosive > exercice leste > plyometrie maximale. Exploite la PAP pour booster la puissance.",
  },
  {
    slug: 'pap',
    label: 'PAP',
    aliases: ['PAP'],
    definition:
      "Post-Activation Potentiation. Phenomene neurologique: apres un effort lourd, le systeme neuromusculaire produit plus de force pendant 3-8 minutes. Principe derriere la FCM.",
  },
  {
    slug: 'drop-jump',
    label: 'Drop Jump',
    aliases: ['Drop Jump', 'drop jump', 'Drop Jumps'],
    definition:
      "On tombe d'une boite (30 cm), absorbe l'atterrissage en moins de 250ms, et ressaute immediatement. Plyometrie reactive. Phase 3 uniquement.",
  },
  {
    slug: 'pogo-jump',
    label: 'Pogo Jump',
    aliases: ['Pogo Jump', 'Pogo Jumps', 'pogo'],
    definition:
      "Petits sauts rapides sur place, chevilles raides, contact sol minimal. Travaille la raideur du tendon d'Achille. Exercice introductif de plyometrie.",
  },
  {
    slug: 'eccentric',
    label: 'Excentrique',
    aliases: ['Excentrique', 'Eccentric', 'eccentrique', 'negatif'],
    definition:
      "Phase de descente controlee d'un exercice. Le muscle produit de la force en s'allongeant. Utilise pour progresser sur les tractions quand on ne peut pas faire le mouvement complet.",
  },
  {
    slug: 'anti-rotation',
    label: 'Anti-rotation',
    aliases: ['Anti-rotation', 'anti-rotation'],
    definition:
      "Exercice ou on resiste a une force qui cherche a faire tourner le tronc. Plus fonctionnel que les crunchs pour le sport. Exemple: Pallof press.",
  },
  {
    slug: 'rdl',
    label: 'RDL',
    aliases: ['RDL'],
    definition:
      "Romanian Deadlift. Les charges descendent le long des jambes en pivotant aux hanches, dos plat, genoux quasi tendus. Travaille ischios, fessiers, bas du dos.",
  },
  {
    slug: 'mcgill-big-3',
    label: 'McGill Big 3',
    aliases: ['McGill Big 3', 'McGill'],
    definition:
      "Les 3 exercices du Dr Stuart McGill pour la stabilite lombaire: curl-up modifie, side plank, bird dog. Renforcent le core sans comprimer les disques.",
  },
  {
    slug: 'bss',
    label: 'BSS',
    aliases: ['BSS', 'Bulgarian Split Squat'],
    definition:
      "Bulgarian Split Squat. Squat unilateral avec pied arriere eleve (sur TRX ou banc). Excellent pour la detente de smash (unilateral).",
  },
  {
    slug: 'kb',
    label: 'KB',
    aliases: ['KB', 'kettlebell'],
    definition:
      "Kettlebell. Boule de fonte avec anse. Outil central du programme pour swings, goblet squats, hip thrusts.",
  },
  {
    slug: 'contacts-plyo',
    label: 'Contacts plyo',
    aliases: ['contacts plyometriques', 'contacts plyo'],
    definition:
      "Nombre total de sauts/impulsions par seance. Recommandations NSCA: 60-80 debutants, jusqu'a 140 avances.",
  },
  {
    slug: 'trx',
    label: 'TRX',
    aliases: ['TRX'],
    definition:
      "Sangles de suspension. Permettent d'ajuster la difficulte des exercices au poids du corps selon l'angle du corps.",
  },
  {
    slug: 'hardstyle',
    label: 'Hardstyle swing',
    aliases: ['Hardstyle swing', 'Hardstyle', 'hardstyle'],
    definition:
      "Variante de swing KB avec explosion maximale des hanches a chaque rep, fessiers contractes au sommet. Different du swing sport (plus ballistique).",
  },
  {
    slug: 'fighter-pullup',
    label: 'Fighter Pullup Program',
    aliases: ['Fighter Pullup Program', 'Fighter Pullup'],
    definition:
      "Protocole de Pavel Tsatsouline. 5 series x 50% du max de reps, 90s de repos. 3x/semaine. Methode de construction de volume pour tractions debutants.",
  },
  {
    slug: 'spike-jump',
    label: 'Spike Jump',
    aliases: ['Spike Jump', 'spike jump'],
    definition:
      "Saut d'attaque au volley: 3 pas d'elan, impulsion 2 pieds, bras vers le haut. Mouvement specifique reproduit a l'entrainement.",
  },
  {
    slug: 'pallof',
    label: 'Pallof Press',
    aliases: ['Pallof Press', 'Pallof'],
    definition:
      "Exercice anti-rotation. Bande elastique fixee a hauteur de nombril sur un point lateral. Etendre les bras devant soi en resistant a la rotation.",
  },
];

const TERM_INDEX = new Map<string, GlossaryTerm>();
for (const term of GLOSSARY) {
  for (const alias of [term.label, ...term.aliases]) {
    TERM_INDEX.set(alias.toLowerCase(), term);
  }
}

export function findGlossaryTerm(text: string): GlossaryTerm | undefined {
  return TERM_INDEX.get(text.toLowerCase());
}

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}

const SORTED_ALIASES = Array.from(TERM_INDEX.keys()).sort((a, b) => b.length - a.length);

export function getSortedAliases(): string[] {
  return SORTED_ALIASES;
}
