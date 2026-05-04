import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { parseISO } from 'date-fns';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GlossaryText } from '@/components/GlossaryText';
import { RestTimer } from '@/components/RestTimer';
import { SetInput } from '@/components/SetInput';
import { useTTS } from '@/hooks/useTTS';
import { useSessionStore } from '@/stores/sessionStore';
import { getExercise } from '@/data/exercises';
import { PHASE_DESCRIPTION, getSessionPlan, SessionType } from '@/data/program';
import { applyDeload } from '@/domain/deload';
import { realisedPlyoContacts, plyoCapStatus } from '@/domain/plyoContacts';
import { resolveDate } from '@/domain/schedule';
import { findSessionByDate, getPlanState, markSessionSkipped } from '@/db/queries';
import { colors, radius, spacing } from '@/theme';

const SESSION_TITLES: Record<SessionType, string> = {
  A: 'Upper Power & Core',
  B: 'Lower Strength & Plyo',
  C: 'Full-body Power',
};

export default function SessionScreen() {
  const params = useLocalSearchParams<{ date: string }>();
  const dateIso = params.date as string;
  const [error, setError] = useState<string | null>(null);
  const [resting, setResting] = useState<{ duration: number } | null>(null);
  const { speak } = useTTS();

  const session = useSessionStore();
  const startingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const plan = await getPlanState();
      if (!plan) {
        setError('Programme non configure');
        return;
      }
      const target = resolveDate(parseISO(dateIso), plan.start_date, plan.week_offset);
      if (!target.week || !target.sessionType || !target.phase) {
        setError('Aucune seance prevue ce jour');
        return;
      }

      const existing = await findSessionByDate(target.isoDate);
      if (existing?.completed_at) {
        setError('Seance deja terminee');
        return;
      }

      let basePlan = getSessionPlan(target.week, target.sessionType);
      if (target.phase === 4) {
        basePlan = applyDeload(basePlan);
      }

      if (cancelled) return;
      // Guard against double-init: synchronous ref check prevents re-entry
      // before `session.start` resolves and updates the store.
      if (session.sessionId == null && !startingRef.current) {
        startingRef.current = true;
        try {
          if (existing && !existing.completed_at) {
            await markSessionSkipped(existing.id);
          }
          await session.start({
            plan: basePlan,
            week: target.week,
            phase: target.phase,
            type: target.sessionType,
            scheduledDate: parseISO(dateIso),
          });
        } finally {
          startingRef.current = false;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dateIso]);

  const currentExercise = session.exercises[session.currentExerciseIdx];
  const plyoCap = session.phase ? PHASE_DESCRIPTION[session.phase as 1 | 2 | 3 | 4].plyoCap : null;
  const realisedContacts = useMemo(
    () =>
      realisedPlyoContacts(
        session.exercises.map((e) => ({
          exerciseSlug: e.prescription.exerciseSlug,
          sets: e.sets.filter((s) => s.done),
        }))
      ),
    [session.exercises]
  );

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retour" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  if (!session.plan || !currentExercise) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Chargement...</Text>
      </View>
    );
  }

  const exerciseDef = getExercise(currentExercise.prescription.exerciseSlug);
  const allSetsDone = session.exercises.every((e) => e.sets.every((s) => s.done));

  const onSetSubmit = async (
    setIdx: number,
    data: { reps: number | null; loadKg: number | null; rpe: number | null }
  ) => {
    await session.recordSetData(session.currentExerciseIdx, setIdx, data);
    const restSec = currentExercise.prescription.setPrescription.rest;
    if (restSec > 0) {
      setResting({ duration: restSec });
    }
  };

  const goToExercise = (idx: number) => {
    session.setCurrentExercise(idx);
    setResting(null);
    const ex = session.exercises[idx];
    if (ex) {
      const def = getExercise(ex.prescription.exerciseSlug);
      const label = ex.prescription.displayLabel ?? def?.name ?? ex.prescription.exerciseSlug;
      speak(`${label}, ${ex.prescription.sets} series de ${ex.prescription.setPrescription.reps} repetitions`);
    }
  };

  const nextSet = currentExercise.sets.find((s) => !s.done);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          Seance {session.type} - {session.type ? SESSION_TITLES[session.type] : ''}
        </Text>
        <Text style={styles.headerSub}>
          Semaine {session.week} - Phase {session.phase}
        </Text>
      </View>

      {plyoCap !== null && (
        <View
          style={[
            styles.plyoBadge,
            plyoCapStatus(realisedContacts, plyoCap) === 'over' && { backgroundColor: colors.danger },
            plyoCapStatus(realisedContacts, plyoCap) === 'warn' && { backgroundColor: colors.warning },
          ]}
        >
          <Text style={styles.plyoText}>
            Contacts plyo: {realisedContacts} / {plyoCap}
          </Text>
        </View>
      )}

      <View style={styles.exerciseTabs}>
        {session.exercises.map((e, i) => {
          const def = getExercise(e.prescription.exerciseSlug);
          const done = e.sets.every((s) => s.done);
          const active = i === session.currentExerciseIdx;
          return (
            <Pressable
              key={i}
              onPress={() => goToExercise(i)}
              style={[styles.tab, active && styles.tabActive, done && styles.tabDone]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
                {i + 1}. {e.prescription.displayLabel ?? def?.name ?? e.prescription.exerciseSlug}
              </Text>
              <Text style={styles.tabSub}>
                {e.sets.filter((s) => s.done).length}/{e.sets.length} series
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.exerciseName}>
          {currentExercise.prescription.displayLabel ?? exerciseDef?.name}
        </Text>
        <Text style={styles.exerciseMeta}>
          {currentExercise.prescription.sets} series x {currentExercise.prescription.setPrescription.reps} - repos {currentExercise.prescription.setPrescription.rest}s
        </Text>
        {exerciseDef?.notes && (
          <GlossaryText style={styles.notes}>{exerciseDef.notes}</GlossaryText>
        )}
        {currentExercise.prescription.setPrescription.notes && (
          <GlossaryText style={[styles.notes, { color: colors.warning }]}>
            {currentExercise.prescription.setPrescription.notes}
          </GlossaryText>
        )}
        {exerciseDef?.videoUrl && (
          <Button
            title="Voir la video (YouTube)"
            variant="secondary"
            onPress={() => Linking.openURL(exerciseDef.videoUrl!)}
            style={{ marginTop: spacing.sm }}
          />
        )}
      </Card>

      <View style={styles.setsRow}>
        {currentExercise.sets.map((s) => (
          <View
            key={s.setIdx}
            style={[styles.setPill, s.done ? styles.setPillDone : styles.setPillTodo]}
          >
            <Text style={[styles.setPillText, !s.done && { color: colors.text }]}>
              {s.done ? `${s.reps ?? '-'} reps` : `Serie ${s.setIdx + 1}`}
            </Text>
            {s.done && s.rpe != null && (
              <Text style={styles.setPillSub}>RPE {s.rpe}</Text>
            )}
          </View>
        ))}
      </View>

      {resting ? (
        <RestTimer
          durationSeconds={resting.duration}
          onComplete={() => setResting(null)}
          onSkip={() => setResting(null)}
        />
      ) : nextSet ? (
        <SetInput
          initialLoadKg={
            currentExercise.sets
              .filter((s) => s.done && s.loadKg != null)
              .map((s) => s.loadKg)
              .pop() ?? null
          }
          onSubmit={(data) => onSetSubmit(nextSet.setIdx, data)}
        />
      ) : (
        <Card>
          <Text style={styles.muted}>Toutes les series de cet exercice sont terminees.</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            {session.currentExerciseIdx + 1 < session.exercises.length ? (
              <Button
                title="Exercice suivant"
                onPress={() => goToExercise(session.currentExerciseIdx + 1)}
                style={{ flex: 1 }}
              />
            ) : null}
            {allSetsDone && (
              <Button
                title="Terminer la seance"
                onPress={() => router.push('/session/summary')}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </Card>
      )}

      <Button
        title="Terminer la seance maintenant"
        variant="ghost"
        onPress={() => router.push('/session/summary')}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl * 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorText: { color: colors.danger, fontSize: 16, textAlign: 'center' },
  muted: { color: colors.textMuted },
  headerRow: { gap: spacing.xs },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  headerSub: { color: colors.textMuted, fontSize: 13 },
  plyoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
  },
  plyoText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  exerciseTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tab: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: '48%',
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  tabDone: { opacity: 0.6 },
  tabText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.primary },
  tabSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  exerciseName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  exerciseMeta: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  notes: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  setsRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginVertical: spacing.sm },
  setPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  setPillDone: { backgroundColor: colors.success, borderColor: colors.success },
  setPillTodo: { backgroundColor: colors.surface, borderColor: colors.border },
  setPillText: { color: colors.bg, fontWeight: '700', fontSize: 12 },
  setPillSub: { color: colors.bg, fontSize: 10 },
});
