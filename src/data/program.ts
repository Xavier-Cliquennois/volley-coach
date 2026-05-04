export type SessionType = 'A' | 'B' | 'C';
export type Phase = 1 | 2 | 3 | 4;

export type SetPrescription = {
  reps: string;
  rest: number;
  notes?: string;
  load?: string;
};

export type ExercisePrescription = {
  exerciseSlug: string;
  sets: number;
  setPrescription: SetPrescription;
  /** Special protocol used (Fighter Pullup, 3/7, FCM, etc.) */
  protocol?: 'standard' | 'fighter-pullup' | 'three-seven' | 'fcm';
  /** Override display name for protocol-specific variants. */
  displayLabel?: string;
};

export type SessionPlan = {
  type: SessionType;
  title: string;
  warmupMinutes: number;
  warmup: string[];
  exercises: ExercisePrescription[];
};

/**
 * Day-of-week mapping for sessions.
 * Tuesday = 2, Thursday = 4, Saturday = 6 (date-fns getDay: Sun=0, Sat=6)
 */
export const SESSION_SCHEDULE: Record<number, SessionType> = {
  2: 'A',
  4: 'B',
  6: 'C',
};

export const NOTIFICATION_HOUR: Record<SessionType, { hour: number; minute: number }> = {
  A: { hour: 11, minute: 0 },
  B: { hour: 11, minute: 0 },
  C: { hour: 13, minute: 0 },
};

export const PHASE_FOR_WEEK: Record<number, Phase> = {
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 2,
  6: 2,
  7: 2,
  8: 2,
  9: 3,
  10: 3,
  11: 3,
  12: 4,
};

export const PHASE_DESCRIPTION: Record<Phase, { name: string; goal: string; plyoCap: number }> = {
  1: { name: 'Accumulation', goal: 'Apprentissage, base de force', plyoCap: 80 },
  2: { name: 'Intensification', goal: 'Force max, hypertrophie', plyoCap: 120 },
  3: { name: 'Realisation', goal: 'Puissance explosive max', plyoCap: 140 },
  4: { name: 'Deload', goal: 'Recuperation, retest', plyoCap: 40 },
};

const COMMON_WARMUP_A = [
  "10 cercles d'epaules avant + arriere",
  '10 cat-cow',
  '10 rotations externes epaule avec bande',
  '10 pompes inclinees',
];

const COMMON_WARMUP_B = ['10 squats a vide (lents)', '5 fentes lentes par jambe', '10 swings KB legers ou hip circles'];

const COMMON_WARMUP_C = ['Mobilite complete (epaules, hanches, chevilles) - 5min', '10 KB swings legers', '3 sauts verticaux a 70%'];

/**
 * PROGRAM[phase][sessionType] = SessionPlan
 * Phase 4 reuses phase 3 with reduced volume/load (handled by deload module).
 */
export const PROGRAM: Record<Exclude<Phase, 4>, Record<SessionType, SessionPlan>> = {
  1: {
    A: {
      type: 'A',
      title: 'Upper Power & Core',
      warmupMinutes: 8,
      warmup: COMMON_WARMUP_A,
      exercises: [
        {
          exerciseSlug: 'pull-up',
          sets: 5,
          protocol: 'fighter-pullup',
          setPrescription: { reps: '50% du max', rest: 90, notes: 'Ajouter 1-2 excentriques en fin si possible' },
        },
        {
          exerciseSlug: 'push-up',
          sets: 4,
          setPrescription: { reps: '8', rest: 120, notes: 'Descente 2s, montee explosive' },
        },
        {
          exerciseSlug: 'trx-row',
          sets: 3,
          setPrescription: { reps: '10', rest: 90, notes: 'Pieds au sol (version facile)' },
        },
        {
          exerciseSlug: 'pallof-press',
          sets: 3,
          setPrescription: { reps: '10/cote', rest: 60, notes: 'Tenir 2s bras tendus' },
        },
        {
          exerciseSlug: 'side-plank',
          sets: 2,
          setPrescription: { reps: '20s/cote', rest: 45, notes: 'Corps aligne' },
        },
        {
          exerciseSlug: 'bird-dog',
          sets: 2,
          setPrescription: { reps: '8/cote', rest: 45, notes: 'Tenir 2-3s en extension' },
        },
      ],
    },
    B: {
      type: 'B',
      title: 'Lower Strength & Plyo',
      warmupMinutes: 5,
      warmup: COMMON_WARMUP_B,
      exercises: [
        { exerciseSlug: 'goblet-squat', sets: 3, setPrescription: { reps: '8', rest: 120, load: 'KB 16 kg', notes: 'Descente 2s, explosif montee' } },
        { exerciseSlug: 'hip-thrust', sets: 3, setPrescription: { reps: '8', rest: 120, notes: 'Contraction 1s en haut' } },
        { exerciseSlug: 'bss', sets: 3, setPrescription: { reps: '6/jambe', rest: 90, notes: 'TRX pour equilibre au besoin' } },
        { exerciseSlug: 'rdl', sets: 3, setPrescription: { reps: '8', rest: 90, notes: 'Dos plat, hanches en arriere' } },
        { exerciseSlug: 'calf-raise', sets: 3, setPrescription: { reps: '10-12', rest: 60, notes: 'Sur marche, amplitude complete' } },
        { exerciseSlug: 'pogo-jump', sets: 3, setPrescription: { reps: '10', rest: 90, notes: 'Chevilles raides, rebond rapide' } },
        { exerciseSlug: 'box-jump', sets: 3, setPrescription: { reps: '5', rest: 90, notes: 'Atterrissage silencieux, redescendre en marchant' } },
      ],
    },
    C: {
      type: 'C',
      title: 'Full-body Power',
      warmupMinutes: 12,
      warmup: COMMON_WARMUP_C,
      exercises: [
        { exerciseSlug: 'goblet-squat', sets: 4, setPrescription: { reps: '6', rest: 180, notes: 'Concentrique explosif' } },
        { exerciseSlug: 'pull-up', sets: 4, protocol: 'fighter-pullup', setPrescription: { reps: '2-3', rest: 120, notes: 'Ou 3 excentriques' } },
        { exerciseSlug: 'kb-swing', sets: 5, setPrescription: { reps: '10', rest: 90, notes: 'Intent maximal' } },
        { exerciseSlug: 'spike-jump', sets: 4, setPrescription: { reps: '4', rest: 120, notes: 'Max effort absolu' } },
        { exerciseSlug: 'box-jump', sets: 4, setPrescription: { reps: '5', rest: 90 } },
        { exerciseSlug: 'mb-overhead-slam', sets: 3, setPrescription: { reps: '8', rest: 60, notes: 'Si MB disponible' } },
        { exerciseSlug: 'lateral-hurdle-hop', sets: 3, setPrescription: { reps: '6/cote', rest: 60 } },
        { exerciseSlug: 'pallof-press', sets: 3, setPrescription: { reps: '10/cote', rest: 60 } },
      ],
    },
  },
  2: {
    A: {
      type: 'A',
      title: 'Upper Power & Core',
      warmupMinutes: 8,
      warmup: COMMON_WARMUP_A,
      exercises: [
        {
          exerciseSlug: 'pull-up',
          sets: 2,
          protocol: 'three-seven',
          displayLabel: 'Tractions 3/7 assiste elastique',
          setPrescription: { reps: '3-4-5-6-7', rest: 150, notes: '15s entre mini-series, 2min30 entre sequences. Elastique calibre 12 reps.' },
        },
        {
          exerciseSlug: 'push-up',
          sets: 2,
          protocol: 'three-seven',
          displayLabel: 'Pompes 3/7 (lestees ou pieds sureleves)',
          setPrescription: { reps: '3-4-5-6-7', rest: 150, notes: 'Charge ~12RM' },
        },
        { exerciseSlug: 'trx-row', sets: 3, setPrescription: { reps: '8-10', rest: 90, notes: 'Pieds sureleves' } },
        { exerciseSlug: 'landmine-press', sets: 3, setPrescription: { reps: '6-8', rest: 90, notes: 'Si KB/haltere disponible' } },
        { exerciseSlug: 'pallof-press', sets: 3, setPrescription: { reps: '10/cote', rest: 60, notes: 'Bande plus resistante' } },
        { exerciseSlug: 'side-plank', sets: 2, setPrescription: { reps: '30s/cote', rest: 45 } },
        { exerciseSlug: 'bird-dog', sets: 2, setPrescription: { reps: '10/cote', rest: 45 } },
      ],
    },
    B: {
      type: 'B',
      title: 'Lower Strength & Plyo',
      warmupMinutes: 5,
      warmup: COMMON_WARMUP_B,
      exercises: [
        { exerciseSlug: 'goblet-squat', sets: 4, setPrescription: { reps: '5-6', rest: 180, load: 'Charge +' } },
        { exerciseSlug: 'hip-thrust', sets: 3, setPrescription: { reps: '6', rest: 120, load: 'Charge +' } },
        { exerciseSlug: 'bss', sets: 3, setPrescription: { reps: '8/jambe', rest: 90, notes: 'Lestee si gilet' } },
        { exerciseSlug: 'rdl', sets: 3, setPrescription: { reps: '8', rest: 90, load: 'Charge +' } },
        { exerciseSlug: 'calf-raise', sets: 3, setPrescription: { reps: '12', rest: 60, load: 'KB en main' } },
        { exerciseSlug: 'pogo-jump', sets: 3, setPrescription: { reps: '12', rest: 90 } },
        { exerciseSlug: 'box-jump', sets: 3, setPrescription: { reps: '6', rest: 90, notes: '40-50 cm' } },
      ],
    },
    C: {
      type: 'C',
      title: 'Full-body Power',
      warmupMinutes: 12,
      warmup: COMMON_WARMUP_C,
      exercises: [
        { exerciseSlug: 'goblet-squat', sets: 5, setPrescription: { reps: '4', rest: 180, load: 'Charge +' } },
        {
          exerciseSlug: 'pull-up',
          sets: 2,
          protocol: 'three-seven',
          displayLabel: 'Tractions 3/7 assiste',
          setPrescription: { reps: '3-4-5-6-7', rest: 150 },
        },
        { exerciseSlug: 'kb-swing', sets: 5, setPrescription: { reps: '12', rest: 90, notes: 'KB 20 kg si possible' } },
        { exerciseSlug: 'spike-jump', sets: 4, setPrescription: { reps: '4', rest: 120 } },
        { exerciseSlug: 'box-jump', sets: 4, setPrescription: { reps: '5', rest: 90, notes: '50 cm' } },
        { exerciseSlug: 'mb-overhead-throw', sets: 3, setPrescription: { reps: '6', rest: 90 } },
        { exerciseSlug: 'mb-overhead-slam', sets: 3, setPrescription: { reps: '8', rest: 60 } },
        { exerciseSlug: 'lateral-hurdle-hop', sets: 3, setPrescription: { reps: '6/cote', rest: 60 } },
      ],
    },
  },
  3: {
    A: {
      type: 'A',
      title: 'Upper Power & Core',
      warmupMinutes: 8,
      warmup: COMMON_WARMUP_A,
      exercises: [
        { exerciseSlug: 'clap-push-up', sets: 3, setPrescription: { reps: '5', rest: 120, notes: 'Debut de seance, intent max' } },
        {
          exerciseSlug: 'pull-up',
          sets: 2,
          protocol: 'three-seven',
          displayLabel: 'Tractions 3/7 strict ou leste',
          setPrescription: { reps: '3-4-5-6-7', rest: 150 },
        },
        {
          exerciseSlug: 'push-up',
          sets: 2,
          protocol: 'three-seven',
          displayLabel: 'Pompes lestees 3/7',
          setPrescription: { reps: '3-4-5-6-7', rest: 150 },
        },
        { exerciseSlug: 'trx-row', sets: 3, setPrescription: { reps: '8', rest: 90, notes: 'Tempo excentrique 3s' } },
        { exerciseSlug: 'mb-overhead-throw', sets: 3, setPrescription: { reps: '6', rest: 90, notes: 'Intent maximal' } },
        { exerciseSlug: 'pallof-press', sets: 3, setPrescription: { reps: '10/cote', rest: 60 } },
        { exerciseSlug: 'side-plank', sets: 2, setPrescription: { reps: '30s/cote', rest: 45 } },
        { exerciseSlug: 'bird-dog', sets: 2, setPrescription: { reps: '10/cote', rest: 45 } },
      ],
    },
    B: {
      type: 'B',
      title: 'Lower Strength & Plyo',
      warmupMinutes: 5,
      warmup: COMMON_WARMUP_B,
      exercises: [
        { exerciseSlug: 'goblet-squat', sets: 5, setPrescription: { reps: '3', rest: 180, load: '~85% 1RM' } },
        { exerciseSlug: 'hip-thrust', sets: 4, setPrescription: { reps: '4', rest: 120, load: 'Lourd' } },
        { exerciseSlug: 'bss', sets: 3, setPrescription: { reps: '6/jambe', rest: 90, load: 'Lestee' } },
        { exerciseSlug: 'rdl', sets: 3, setPrescription: { reps: '8', rest: 90 } },
        { exerciseSlug: 'calf-raise', sets: 3, setPrescription: { reps: '10', rest: 60, load: 'Lestees' } },
        { exerciseSlug: 'pogo-jump', sets: 3, setPrescription: { reps: '15', rest: 90, notes: 'Vitesse max' } },
        { exerciseSlug: 'box-jump', sets: 4, setPrescription: { reps: '6', rest: 90, notes: '50 cm' } },
        { exerciseSlug: 'lateral-hurdle-hop', sets: 3, setPrescription: { reps: '6/cote', rest: 60 } },
      ],
    },
    C: {
      type: 'C',
      title: 'Full-body Power - FCM',
      warmupMinutes: 12,
      warmup: COMMON_WARMUP_C,
      exercises: [
        {
          exerciseSlug: 'goblet-squat',
          sets: 3,
          protocol: 'fcm',
          displayLabel: 'FCM - Squat lourd (~85% 1RM)',
          setPrescription: { reps: '3', rest: 10, notes: '10s avant Drop Jump' },
        },
        {
          exerciseSlug: 'drop-jump',
          sets: 3,
          protocol: 'fcm',
          displayLabel: 'FCM - Drop Jump 30 cm',
          setPrescription: { reps: '5', rest: 10, notes: '10s avant Squat leste' },
        },
        {
          exerciseSlug: 'goblet-squat',
          sets: 3,
          protocol: 'fcm',
          displayLabel: 'FCM - Squat leste (gilet 7% PdC)',
          setPrescription: { reps: '3', rest: 10, notes: '10s avant Spike Jump' },
        },
        {
          exerciseSlug: 'spike-jump',
          sets: 3,
          protocol: 'fcm',
          displayLabel: 'FCM - Spike Jump max effort',
          setPrescription: { reps: '3', rest: 300, notes: '5 minutes avant tour suivant' },
        },
        { exerciseSlug: 'pallof-press', sets: 3, setPrescription: { reps: '10/cote', rest: 60 } },
        { exerciseSlug: 'mb-overhead-slam', sets: 3, setPrescription: { reps: '8', rest: 60 } },
        { exerciseSlug: 'side-plank', sets: 2, setPrescription: { reps: '30s/cote', rest: 45 } },
      ],
    },
  },
};

export function getSessionPlan(week: number, type: SessionType): SessionPlan {
  const phase = PHASE_FOR_WEEK[week];
  if (!phase) {
    throw new Error(`Invalid week: ${week}`);
  }
  if (phase === 4) {
    // Deload reuses phase 3 plan; volume/load reduction applied at runtime.
    return PROGRAM[3][type];
  }
  return PROGRAM[phase][type];
}

export const TOTAL_WEEKS = 12;
