import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { recordTest } from '@/db/queries';
import { TestType } from '@/db/schema';
import { colors, radius, spacing } from '@/theme';

const TEST_INFO: Record<TestType, { title: string; unit: string; help: string }> = {
  cmj: {
    title: 'Test CMJ - Detente verticale',
    unit: 'cm',
    help: 'Mesure ta detente avec My Jump 2 (gratuit). Saute 3 fois, prends la meilleure mesure.',
  },
  pullup_max: {
    title: 'Test - Tractions max',
    unit: 'reps',
    help: 'Echauffe-toi puis fais le maximum de tractions strictes consecutives. Compte les reps avec corps gaine, sans balancement.',
  },
  pushup_max: {
    title: 'Test - Pompes max',
    unit: 'reps',
    help: 'Maximum de pompes strictes consecutives. Corps aligne, descente complete.',
  },
  spike_jump: {
    title: 'Test - Spike Jump',
    unit: 'cm',
    help: 'Mesure ton saut d\'attaque (3 pas, 2 pieds, max effort). Marqueur au mur ou Vertec.',
  },
};

export default function TestScreen() {
  const params = useLocalSearchParams<{ type: string }>();
  const type = params.type as TestType;
  const info = TEST_INFO[type];
  const [value, setValue] = useState('');

  if (!info) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Test inconnu</Text>
      </View>
    );
  }

  const submit = async () => {
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num <= 0) return;
    await recordTest({ type, value: num, unit: info.unit });
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{info.title}</Text>
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.body}>{info.help}</Text>
      </Card>
      <Text style={styles.label}>Resultat ({info.unit})</Text>
      <TextInput
        keyboardType="decimal-pad"
        value={value}
        onChangeText={setValue}
        style={styles.input}
        placeholder="0"
        placeholderTextColor={colors.textMuted}
      />
      <Button title="Enregistrer" onPress={submit} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
  muted: { color: colors.textMuted },
});
