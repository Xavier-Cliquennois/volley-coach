import { create } from 'zustand';
import {
  createExerciseLog,
  createSession,
  completeSession,
  recordSet,
} from '@/db/queries';
import { ExercisePrescription, SessionPlan, SessionType } from '@/data/program';
import { format } from 'date-fns';

export type LiveSet = {
  setIdx: number;
  reps: number | null;
  loadKg: number | null;
  rpe: number | null;
  done: boolean;
};

export type LiveExercise = {
  prescription: ExercisePrescription;
  exerciseLogId: number | null;
  sets: LiveSet[];
};

type SessionState = {
  sessionId: number | null;
  plan: SessionPlan | null;
  week: number | null;
  phase: number | null;
  type: SessionType | null;
  startedAt: number | null;
  exercises: LiveExercise[];
  currentExerciseIdx: number;
  start: (input: {
    plan: SessionPlan;
    week: number;
    phase: number;
    type: SessionType;
    scheduledDate: Date;
  }) => Promise<void>;
  recordSetData: (
    exerciseIdx: number,
    setIdx: number,
    data: { reps: number | null; loadKg: number | null; rpe: number | null }
  ) => Promise<void>;
  setCurrentExercise: (idx: number) => void;
  finish: (notes?: string, perceivedEffort?: number) => Promise<void>;
  reset: () => void;
};

const emptyState = {
  sessionId: null,
  plan: null,
  week: null,
  phase: null,
  type: null,
  startedAt: null,
  exercises: [],
  currentExerciseIdx: 0,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...emptyState,

  start: async ({ plan, week, phase, type, scheduledDate }) => {
    const sessionId = await createSession({
      scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
      week,
      phase,
      type,
    });
    const exercises: LiveExercise[] = [];
    for (let i = 0; i < plan.exercises.length; i++) {
      const presc = plan.exercises[i];
      const exerciseLogId = await createExerciseLog({
        sessionId,
        exerciseSlug: presc.exerciseSlug,
        orderIdx: i,
      });
      const sets: LiveSet[] = Array.from({ length: presc.sets }, (_, idx) => ({
        setIdx: idx,
        reps: null,
        loadKg: null,
        rpe: null,
        done: false,
      }));
      exercises.push({ prescription: presc, exerciseLogId, sets });
    }
    set({
      sessionId,
      plan,
      week,
      phase,
      type,
      startedAt: Date.now(),
      exercises,
      currentExerciseIdx: 0,
    });
  },

  recordSetData: async (exerciseIdx, setIdx, data) => {
    const state = get();
    const exercise = state.exercises[exerciseIdx];
    if (!exercise || !exercise.exerciseLogId) return;
    await recordSet({
      exerciseLogId: exercise.exerciseLogId,
      setIdx,
      reps: data.reps,
      loadKg: data.loadKg,
      rpe: data.rpe,
    });
    const newExercises = state.exercises.map((e, i) => {
      if (i !== exerciseIdx) return e;
      const newSets = e.sets.map((s) =>
        s.setIdx === setIdx ? { ...s, ...data, done: true } : s
      );
      return { ...e, sets: newSets };
    });
    set({ exercises: newExercises });
  },

  setCurrentExercise: (idx) => set({ currentExerciseIdx: idx }),

  finish: async (notes, perceivedEffort) => {
    const state = get();
    if (!state.sessionId || !state.startedAt) return;
    const durationSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
    await completeSession(state.sessionId, {
      durationSeconds,
      notes,
      perceivedEffort,
    });
    set(emptyState);
  },

  reset: () => set(emptyState),
}));
