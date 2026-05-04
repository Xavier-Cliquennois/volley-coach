import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from './Button';
import { colors, radius, spacing } from '@/theme';

type Props = {
  initialReps?: number | null;
  initialLoadKg?: number | null;
  initialRpe?: number | null;
  onSubmit: (data: { reps: number | null; loadKg: number | null; rpe: number | null }) => void;
};

export function SetInput({ initialReps, initialLoadKg, initialRpe, onSubmit }: Props) {
  const [reps, setReps] = useState(initialReps?.toString() ?? '');
  const [loadKg, setLoadKg] = useState(initialLoadKg?.toString() ?? '');
  const [rpe, setRpe] = useState<number | null>(initialRpe ?? null);

  const submit = () => {
    onSubmit({
      reps: reps ? parseInt(reps, 10) : null,
      loadKg: loadKg ? parseFloat(loadKg.replace(',', '.')) : null,
      rpe,
    });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Saisie de la serie</Text>

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Reps</Text>
          <TextInput
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Charge (kg)</Text>
          <TextInput
            keyboardType="decimal-pad"
            value={loadKg}
            onChangeText={setLoadKg}
            placeholder="-"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>
      </View>

      <Text style={styles.fieldLabel}>RPE (effort ressenti)</Text>
      <View style={styles.rpeRow}>
        {[5, 6, 7, 8, 9, 10].map((v) => (
          <Pressable
            key={v}
            onPress={() => setRpe(v)}
            style={[styles.rpePill, rpe === v && styles.rpePillActive]}
          >
            <Text style={[styles.rpeText, rpe === v && styles.rpeTextActive]}>{v}</Text>
          </Pressable>
        ))}
      </View>

      <Button title="Valider la serie" onPress={submit} style={{ marginTop: spacing.md }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1, gap: spacing.xs },
  fieldLabel: { color: colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rpeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  rpePill: {
    flex: 1,
    minWidth: 44,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rpePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rpeText: { color: colors.text, fontWeight: '600' },
  rpeTextActive: { color: colors.bg },
});
