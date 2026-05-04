import { ExercisePrescription, SessionPlan } from '@/data/program';
import { getExercise } from '@/data/exercises';

/**
 * Applies the phase 4 deload modifications:
 *  - drops every plyo exercise except pogo jumps (spec section 5.4)
 *  - halves the number of sets on the rest
 *  - flags load reduction in the prescription note
 */
export function applyDeload(plan: SessionPlan): SessionPlan {
  return {
    ...plan,
    title: `${plan.title} - DELOAD`,
    exercises: plan.exercises
      .filter((ex) => {
        const def = getExercise(ex.exerciseSlug);
        if (def?.plyoContact && ex.exerciseSlug !== 'pogo-jump') return false;
        return true;
      })
      .map((ex): ExercisePrescription => {
        const halvedSets = Math.max(1, Math.floor(ex.sets / 2));
        return {
          ...ex,
          sets: halvedSets,
          setPrescription: {
            ...ex.setPrescription,
            notes: [ex.setPrescription.notes, 'Charges -10 a -15%'].filter(Boolean).join(' | '),
          },
        };
      }),
  };
}
