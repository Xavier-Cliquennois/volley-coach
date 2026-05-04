import { SetRow } from '@/db/schema';

export type SetData = Pick<SetRow, 'reps' | 'load_kg' | 'rpe'>;

export type ProgressionSuggestion = {
  /** Multiplier to apply to load (1.05 = +5%). */
  loadMultiplier: number;
  /** Recommended rep delta vs last session (e.g. +1). */
  repDelta: number;
  /** Human-readable reason. */
  rationale: string;
};

/**
 * Section 6.1 of the spec: if all prescribed sets are completed at RPE <= 7,
 * progress (load OR reps, not both). If RPE > 9 anywhere, hold.
 */
export function suggestProgression(lastSets: SetData[]): ProgressionSuggestion {
  if (lastSets.length === 0) {
    return { loadMultiplier: 1, repDelta: 0, rationale: 'Pas de donnees precedentes' };
  }
  const rpes = lastSets.map((s) => s.rpe).filter((r): r is number => r !== null);
  const maxRpe = rpes.length > 0 ? Math.max(...rpes) : null;
  const avgRpe = rpes.length > 0 ? rpes.reduce((a, b) => a + b, 0) / rpes.length : null;

  if (maxRpe !== null && maxRpe > 9) {
    return { loadMultiplier: 1, repDelta: 0, rationale: 'RPE > 9 sur la derniere seance, on maintient la charge' };
  }
  if (avgRpe !== null && avgRpe <= 7) {
    return { loadMultiplier: 1.05, repDelta: 0, rationale: 'RPE moyen <= 7, on peut monter +5% de charge' };
  }
  if (avgRpe !== null && avgRpe <= 8) {
    return { loadMultiplier: 1, repDelta: 1, rationale: 'RPE moyen ~8, on peut tenter +1 rep' };
  }
  return { loadMultiplier: 1, repDelta: 0, rationale: 'On consolide, meme charge meme reps' };
}

export type PullupTier = 1 | 2 | 3 | 4;

/**
 * Section 6.2 of the spec: pullup progression tiers.
 * Tier 1: Fighter Pullup (max < 6).
 * Tier 2: 3/7 with band (max >= 6).
 * Tier 3: 3/7 strict (max >= 8).
 * Tier 4: 3/7 weighted (max >= 12).
 */
export function getPullupTier(maxReps: number): PullupTier {
  if (maxReps >= 12) return 4;
  if (maxReps >= 8) return 3;
  if (maxReps >= 6) return 2;
  return 1;
}

export function describePullupTier(tier: PullupTier): string {
  switch (tier) {
    case 1:
      return 'Palier 1 - Fighter Pullup (5x50% du max, repos 90s)';
    case 2:
      return 'Palier 2 - 3/7 assiste elastique (objectif 8 reps strictes)';
    case 3:
      return 'Palier 3 - 3/7 strict (objectif 12 reps strictes)';
    case 4:
      return 'Palier 4 - 3/7 leste (gilet 5/10/15 kg)';
  }
}

export type PushupTier = 1 | 2 | 3 | 4;

/** Section 6.3 of the spec. */
export function getPushupTier(maxReps: number, isPhase3: boolean): PushupTier {
  if (isPhase3) return 4;
  if (maxReps >= 25) return 3;
  if (maxReps >= 20) return 2;
  return 1;
}

export function describePushupTier(tier: PushupTier): string {
  switch (tier) {
    case 1:
      return 'Palier 1 - Pompes standard 4x8 -> 4x12';
    case 2:
      return 'Palier 2 - Pompes pieds sureleves 4x8 -> 3/7';
    case 3:
      return 'Palier 3 - 3/7 avec gilet leste 5 kg';
    case 4:
      return 'Palier 4 - Clap push-ups 3x5 en debut de seance';
  }
}

/**
 * Returns the Fighter Pullup target reps per set: 50% of max, rounded down,
 * minimum 1.
 */
export function fighterPullupReps(maxReps: number): number {
  return Math.max(1, Math.floor(maxReps / 2));
}
