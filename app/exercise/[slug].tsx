import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GlossaryText } from '@/components/GlossaryText';
import { getExercise } from '@/data/exercises';
import { colors, radius, spacing } from '@/theme';

export default function ExerciseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const exercise = slug ? getExercise(slug) : undefined;

  if (!exercise) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Exercice introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text style={styles.category}>{exercise.category}</Text>

      <Card title="Muscles cibles" style={{ marginTop: spacing.md }}>
        <Text style={styles.body}>{exercise.muscles}</Text>
      </Card>

      <Card title="Materiel" style={{ marginTop: spacing.sm }}>
        <Text style={styles.body}>{exercise.equipment}</Text>
      </Card>

      <Card title="Notes techniques" style={{ marginTop: spacing.sm }}>
        <GlossaryText style={styles.body}>{exercise.notes}</GlossaryText>
      </Card>

      {exercise.videoUrl && (
        <Button
          title="Voir la video sur YouTube"
          onPress={() => Linking.openURL(exercise.videoUrl!)}
          style={{ marginTop: spacing.lg }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  category: { color: colors.primary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
  muted: { color: colors.textMuted },
});
