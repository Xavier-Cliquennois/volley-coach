import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { recordBodyWeight } from '@/db/queries';
import { colors, radius, spacing } from '@/theme';

export default function WeightScreen() {
  const [value, setValue] = useState('');

  const submit = async () => {
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || num <= 0) return;
    await recordBodyWeight(num);
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pesee hebdomadaire</Text>
      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.body}>
          Pese-toi a jeun, le meme jour de la semaine si possible. Pour ce programme, l'objectif
          est le maintien ou une legere prise (sous-poids initial).
        </Text>
      </Card>
      <Text style={styles.label}>Poids (kg)</Text>
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
});
