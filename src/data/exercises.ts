export type ExerciseCategory =
  | 'upper-strength'
  | 'lower-strength'
  | 'core'
  | 'plyometric'
  | 'upper-power';

export type Exercise = {
  slug: string;
  name: string;
  category: ExerciseCategory;
  muscles: string;
  equipment: string;
  videoUrl?: string;
  notes: string;
  /** True if this exercise counts toward the plyo contact total. */
  plyoContact?: boolean;
};

export const EXERCISES: Exercise[] = [
  {
    slug: 'pull-up',
    name: 'Tractions (Pull-up)',
    category: 'upper-strength',
    muscles: 'Grand dorsal, biceps, rhomboides, core',
    equipment: 'Barre de tractions',
    videoUrl: 'https://www.youtube.com/watch?v=-G19rztAiVY',
    notes:
      "Prise pronation largeur epaules. Corps gaine, pas de balancement. Phase 1: 5x50% du max (Fighter Pullup). Phase 2: 3/7 avec elastique. Phase 3: 3/7 strict ou leste.",
  },
  {
    slug: 'negative-pull-up',
    name: 'Tractions excentriques',
    category: 'upper-strength',
    muscles: 'Grand dorsal, biceps',
    equipment: 'Barre de tractions',
    videoUrl: 'https://www.youtube.com/watch?v=ELOKABEA1mU',
    notes:
      "Monter en sautant ou sur chaise. Descendre en 4-5 secondes controle. Utilise quand on ne peut pas faire de tractions concentriques completes.",
  },
  {
    slug: 'push-up',
    name: 'Pompes',
    category: 'upper-strength',
    muscles: 'Pectoraux, triceps, deltoide anterieur, serratus',
    equipment: 'Aucun',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    notes:
      "Corps aligne de la tete aux talons. Descente 2s controlee, montee explosive (intent maximal meme si lente). Variations selon phase: standard > pieds sureleves > lestees > clap push-ups.",
  },
  {
    slug: 'clap-push-up',
    name: 'Clap Push-up',
    category: 'upper-power',
    muscles: 'Pectoraux, triceps, deltoides',
    equipment: 'Aucun',
    notes:
      "Pompes avec impulsion explosive et tap des mains au sommet. Phase 3 uniquement. 3x5 en debut de seance avec intent maximal.",
  },
  {
    slug: 'trx-row',
    name: 'TRX Inverted Row',
    category: 'upper-strength',
    muscles: 'Grand dorsal, rhomboides, trapezes moyens, biceps',
    equipment: 'TRX',
    videoUrl: 'https://www.youtube.com/watch?v=iT_oaf3k0Xw',
    notes:
      "Corps planche, tirer les coudes vers les hanches en serrant les omoplates. Plus le corps est horizontal, plus c'est difficile. Pieds sureleves = version avancee.",
  },
  {
    slug: 'landmine-press',
    name: 'Landmine Press',
    category: 'upper-strength',
    muscles: 'Deltoides, pectoraux, triceps, core',
    equipment: 'Haltere ou KB (optionnel)',
    videoUrl: 'https://www.youtube.com/watch?v=lVMnCcLKHQs',
    notes:
      "Trajectoire diagonale securisee pour l'epaule. Alternative au developpe militaire. Optionnel - phase 2 si haltere disponible.",
  },
  {
    slug: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'lower-strength',
    muscles: 'Quadriceps, fessiers, ischio-jambiers, core',
    equipment: 'KB 16 kg > 24 kg',
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    notes:
      "KB tenu contre la poitrine. Descendre a la parallele ou plus. Genoux dans l'axe des pieds. Concentrique explosif (intent maximal). Dos droit.",
  },
  {
    slug: 'hip-thrust',
    name: 'Hip Thrust',
    category: 'lower-strength',
    muscles: 'Fessiers, ischio-jambiers',
    equipment: 'KB pose sur le bassin, dos sur canape',
    videoUrl: 'https://www.youtube.com/watch?v=pF17m_CXfL0',
    notes:
      "Epaules sur le bord du canape, pieds a plat. Pousser les hanches vers le haut jusqu'a alignement dos-cuisses. Contraction 1s en haut. Pas de hyperextension lombaire.",
  },
  {
    slug: 'bss',
    name: 'Bulgarian Split Squat (BSS) TRX',
    category: 'lower-strength',
    muscles: 'Quadriceps, fessiers, stabilisateurs hanche',
    equipment: 'TRX',
    videoUrl: 'https://www.youtube.com/watch?v=Z9hYNycitBM',
    notes:
      "Pied arriere dans le TRX a hauteur de genou. Genou avant dans l'axe. Descendre jusqu'a quasi-contact genou arriere au sol. Debutant: mains sur le TRX pour l'equilibre.",
  },
  {
    slug: 'rdl',
    name: 'RDL - Romanian Deadlift',
    category: 'lower-strength',
    muscles: 'Ischio-jambiers, grand fessier, erecteurs du rachis',
    equipment: 'KB ou halteres',
    videoUrl: 'https://www.youtube.com/watch?v=hQgFixeXdZo',
    notes:
      "Charges tenues devant les cuisses. Hanches en arriere, dos plat, genoux legerement flechis. Descendre jusqu'a mi-tibia ou tension dans les ischios. Remonter en poussant les hanches vers l'avant.",
  },
  {
    slug: 'calf-raise',
    name: 'Calf Raises (unilateral)',
    category: 'lower-strength',
    muscles: 'Triceps sural (gastrocnemiens + soleaire)',
    equipment: 'Marche ou rebord. KB optionnel.',
    notes:
      "Amplitude complete (talon sous le bord de la marche en bas, pointe de pied au max en haut). Unilateral = plus difficile et plus fonctionnel.",
  },
  {
    slug: 'pallof-press',
    name: 'Pallof Press',
    category: 'core',
    muscles: 'Obliques, transverse, multifides (anti-rotation)',
    equipment: 'Bande elastique fixee a hauteur de nombril',
    videoUrl: 'https://www.youtube.com/watch?v=lqPrSGXfL1Q',
    notes:
      "Debout de cote par rapport au point d'ancrage. Tenir la bande a la poitrine, etendre les bras devant soi, tenir 2s, ramener. Resister a la rotation. Ne pas tourner les epaules.",
  },
  {
    slug: 'side-plank',
    name: 'McGill Side Plank',
    category: 'core',
    muscles: 'Obliques, carre des lombes, fessiers',
    equipment: 'Aucun',
    videoUrl: 'https://www.youtube.com/watch?v=2aGunzN5YWA',
    notes:
      "Corps aligne de la tete aux pieds. Appui sur l'avant-bras et le cote du pied (ou genoux pour version facile). Pas d'affaissement des hanches.",
  },
  {
    slug: 'bird-dog',
    name: 'McGill Bird Dog',
    category: 'core',
    muscles: 'Erecteurs du rachis, fessiers, epaule stabilisatrice',
    equipment: 'Aucun',
    videoUrl: 'https://www.youtube.com/watch?v=2aGunzN5YWA',
    notes:
      "4 pattes. Etendre bras droit + jambe gauche simultanement. Dos plat (ne pas cambrer). Tenir 2-3s. Alterner cotes.",
  },
  {
    slug: 'pogo-jump',
    name: 'Pogo Jumps',
    category: 'plyometric',
    muscles: "Triceps sural, tendon d'Achille (reflexe myotatique)",
    equipment: 'Aucun',
    videoUrl: 'https://www.youtube.com/watch?v=8VddB27UkY4',
    notes:
      "Petits sauts rapides sur place. Chevilles raides. Contact sol minimal. Mains sur les hanches. Ne pas flechir les genoux. Objectif: rebond rapide comme une balle.",
    plyoContact: true,
  },
  {
    slug: 'box-jump',
    name: 'Box Jumps',
    category: 'plyometric',
    muscles: 'Quadriceps, fessiers, mollets',
    equipment: 'Boite, banc ou marches solides (30-50 cm)',
    videoUrl: 'https://www.youtube.com/watch?v=G-bxQY57mKc',
    notes:
      "Depart flechi, swing des bras, impulsion maximale. Atterrissage silencieux et amorti sur la boite (mi-pied). Redescendre en marchant (jamais en sautant). Repos complet entre reps.",
    plyoContact: true,
  },
  {
    slug: 'drop-jump',
    name: 'Drop Jumps (phase 3)',
    category: 'plyometric',
    muscles: 'Quadriceps, triceps sural',
    equipment: 'Boite 30 cm',
    notes:
      "Tomber de la boite, atterrir 2 pieds simultanement, ressauter immediatement. Contact sol < 250ms. Pas de pause entre l'atterrissage et le ressaut. Phase 3 uniquement.",
    plyoContact: true,
  },
  {
    slug: 'lateral-hurdle-hop',
    name: 'Lateral Hurdle Hops',
    category: 'plyometric',
    muscles: 'Fessiers, adducteurs, stabilisateurs cheville',
    equipment: 'Obstacle bas (~20-30 cm)',
    notes:
      "Saut lateral par-dessus l'obstacle. Atterrissage sur 1 pied, amorti stable. Alternance droite/gauche. Simule les deplacements lateraux au volley.",
    plyoContact: true,
  },
  {
    slug: 'spike-jump',
    name: 'Spike Jump (approche 3 pas)',
    category: 'plyometric',
    muscles: 'Quadriceps, fessiers, mollets, deltoides',
    equipment: 'Aucun. Espace de 3-4 m.',
    videoUrl: 'https://www.youtube.com/watch?v=OX_S22u5GmM',
    notes:
      "3 pas d'elan (pas-pas-saut), impulsion 2 pieds, bras vers le haut en simulant le smash. Intent maximal a chaque saut. Reproduit exactement le saut d'attaque au volley. Repos complet entre reps.",
    plyoContact: true,
  },
  {
    slug: 'kb-swing',
    name: 'KB Swing Hardstyle',
    category: 'upper-power',
    muscles: 'Grand fessier, ischio-jambiers, erecteurs',
    equipment: 'KB 16 kg > 20 kg',
    videoUrl: 'https://www.youtube.com/watch?v=6cXVxLqTQM8',
    notes:
      "Ce n'est pas un squat. Les hanches propulsent la KB. Charniere aux hanches (hinge), dos plat, genoux legerement flechis. KB entre les jambes en arriere, explosion des hanches pour propulser la KB jusqu'a hauteur epaules. Fessiers contractes au sommet.",
  },
  {
    slug: 'mb-overhead-throw',
    name: 'MB Overhead Throw',
    category: 'upper-power',
    muscles: 'Deltoides, triceps, pectoraux, core (chaine smash)',
    equipment: 'Medecine ball 3-4 kg + mur',
    notes:
      "Tenir la MB a 2 mains derriere la tete. Lancer contre le mur avec force maximale en simulant le geste du smash. Rattraper. Travaille la chaine cinetique tronc-epaule specifique au volley.",
  },
  {
    slug: 'mb-overhead-slam',
    name: 'MB Overhead Slam',
    category: 'upper-power',
    muscles: 'Grand dorsal, abdominaux, deltoides, triceps',
    equipment: 'Slam ball 5-6 kg',
    notes:
      "MB a bout de bras au-dessus de la tete. Lancer violemment au sol. Attraper le rebond ou ramasser. Puissance explosive descendante.",
  },
];

const EXERCISE_INDEX = new Map(EXERCISES.map((e) => [e.slug, e]));

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISE_INDEX.get(slug);
}
