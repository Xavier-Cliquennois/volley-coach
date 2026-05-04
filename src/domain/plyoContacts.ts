import { ExercisePrescription, SessionPlan } from '@/data/program';
import { getExercise } from '@/data/exercises';

/**
 * Parses rep strings like "10", "5", "6/cote", "3-4-5-6-7" into a numeric
 * count of foot contacts. For "/cote" we double, for "3-4-5-6-7" we sum.
 */
export function repsStringToContacts(reps: string): number {
  const cleaned = reps.toLowerCase().replace(/\s/g, '');
  if (cleaned.includes('-')) {
    return cleaned
      .split('-')
      .map((p) => parseInt(p, 10))
      .filter((n) => !isNaN(n))
      .reduce((a, b) => a + b, 0);
  }
  const match = cleaned.match(/(\d+)/);
  if (!match) return 0;
  const base = parseInt(match[1], 10);
  if (cleaned.includes('/cote') || cleaned.includes('/jambe')) {
    return base * 2;
  }
  return base;
}

/** Sum the planned plyo contacts for a session. */
export function plannedPlyoContacts(plan: SessionPlan): number {
  let total = 0;
  for (const ex of plan.exercises) {
    const exercise = getExercise(ex.exerciseSlug);
    if (!exercise?.plyoContact) continue;
    const perSet = repsStringToContacts(ex.setPrescription.reps);
    total += perSet * ex.sets;
  }
  return total;
}

/** Compute realised plyo contacts from logged sets. */
export function realisedPlyoContacts(
  exercises: Array<{ exerciseSlug: string; sets: Array<{ reps: number | null }> }>
): number {
  let total = 0;
  for (const e of exercises) {
    const def = getExercise(e.exerciseSlug);
    if (!def?.plyoContact) continue;
    for (const s of e.sets) {
      if (s.reps != null) total += s.reps;
    }
  }
  return total;
}

export function plyoCapStatus(actual: number, cap: number): 'ok' | 'warn' | 'over' {
  if (actual > cap) return 'over';
  if (actual > cap * 0.9) return 'warn';
  return 'ok';
}
