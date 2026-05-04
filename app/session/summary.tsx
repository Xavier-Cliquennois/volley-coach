import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useSessionStore } from '@/stores/sessionStore';
import { recordJournal } from '@/db/queries';
import { getExercise } from '@/data/exercises';
import { colors, radius, spacing } from '@/theme';
import { realisedPlyoContacts } from '@/domain/plyoContacts';
import { PHASE_DESCRIPTION } from '@/data/program';

export default function SessionSummary() {
  const session = useSessionStore();
  const [notes, setNotes] = useState('');
  const [pain, setPain] = useState('');
  const [effort, setEffort] = useState<number | null>(null);

  const finish = async () => {
    if (notes.trim() || pain.trim()) {
      await recordJournal({
        sessionId: session.sessionId ?? undefined,
        body: notes.trim(),
        painZones: pain.trim() || undefined,
      });
    }
    await session.finish(notes.trim() || undefined, effort ?? undefined);
    router.replace('/(tabs)');
  };

  const realisedContacts = realisedPlyoContacts(
    session.exercises.map((e) => ({
      exerciseSlug: e.prescription.exerciseSlug,
      sets: e.sets.filter((s) => s.done),
    }))
  );

  const totalReps = session.exercises.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.done).reduce((a, s) => a + (s.reps ?? 0), 0),
    0
  );

  const phaseInfo = session.phase ? PHASE_DESCRIPTION[session.phase as 1 | 2 | 3 | 4] : null;
  const plyoCap = phaseInfo?.plyoCap ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recap de la seance</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalReps}</Text>
          <Text style={styles.statLabel}>Reps totales</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{realisedContacts}</Text>
          <Text style={styles.statLabel}>Contacts plyo / {plyoCap}</Text>
        </View>
      </View>

      <Card title="Detail" style={{ marginTop: spacing.md }}>
        {session.exercises.map((e, i) => {
          const def = getExercise(e.prescription.exerciseSlug);
          const done = e.sets.filter((s) => s.done);
          return (
            <View key={i} style={styles.exerciseLine}>
              <Text style={styles.exerciseLineName}>
                {e.prescription.displayLabel ?? def?.name ?? e.prescription.exerciseSlug}
              </Text>
              <Text style={styles.exerciseLineMeta}>
                {done.length}/{e.sets.length} series
                {done.length > 0 ? ` - ${done.map((s) => s.reps ?? '?').join(', ')} reps` : ''}
              </Text>
            </View>
          );
        })}
      </Card>

      <Card title="Effort global (RPE 1-10)" style={{ marginTop: spacing.md }}>
        <View style={styles.rpeRow}>
          {[6, 7, 8, 9, 10].map((v) => (
            <Button
              key={v}
              title={v.toString()}
              variant={effort === v ? 'primary' : 'secondary'}
              onPress={() => setEffort(v)}
              style={{ flex: 1 }}
            />
          ))}
        </View>
      </Card>

      <Card title="Notes (optionnel)" style={{ marginTop: spacing.md }}>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Comment t'es-tu senti ?"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </Card>

      <Card title="Douleurs / zones a surveiller" style={{ marginTop: spacing.md }}>
        <TextInput
          value={pain}
          onChangeText={setPain}
          placeholder="Genou droit, epaule gauche..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </Card>

      <Button title="Valider la seance" onPress={finish} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl * 2 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: { color: colors.primary, fontSize: 28, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  exerciseLine: { paddingVertical: spacing.xs },
  exerciseLineName: { color: colors.text, fontWeight: '600' },
  exerciseLineMeta: { color: colors.textMuted, fontSize: 12 },
  rpeRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
