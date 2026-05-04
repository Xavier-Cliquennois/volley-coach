import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LineChart } from '@/components/Chart';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  getBodyWeightHistory,
  getLatestTest,
  getTestHistory,
} from '@/db/queries';
import { describePullupTier, getPullupTier } from '@/domain/progression';
import { colors, radius, spacing } from '@/theme';

type Series = { x: number; y: number }[];

export default function Progress() {
  const [cmj, setCmj] = useState<Series>([]);
  const [pullup, setPullup] = useState<Series>([]);
  const [pushup, setPushup] = useState<Series>([]);
  const [weight, setWeight] = useState<Series>([]);
  const [pullupMax, setPullupMax] = useState<number | null>(null);
  const [pushupMax, setPushupMax] = useState<number | null>(null);

  const load = useCallback(async () => {
    const cmjHistory = await getTestHistory('cmj');
    setCmj(cmjHistory.map((r, i) => ({ x: i, y: r.value })));
    const pullupHistory = await getTestHistory('pullup_max');
    setPullup(pullupHistory.map((r, i) => ({ x: i, y: r.value })));
    const pushupHistory = await getTestHistory('pushup_max');
    setPushup(pushupHistory.map((r, i) => ({ x: i, y: r.value })));
    const weightHistory = await getBodyWeightHistory();
    setWeight(weightHistory.map((r, i) => ({ x: i, y: r.value_kg })));

    const latestPull = await getLatestTest('pullup_max');
    setPullupMax(latestPull?.value ?? null);
    const latestPush = await getLatestTest('pushup_max');
    setPushupMax(latestPush?.value ?? null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const tier = pullupMax != null ? getPullupTier(pullupMax) : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Evolution</Text>

      {tier && (
        <Card title="Palier tractions actuel" subtitle={describePullupTier(tier)} style={{ marginTop: spacing.md }} />
      )}

      <View style={{ marginTop: spacing.lg }}>
        <LineChart title="Detente verticale (CMJ)" data={cmj} unit=" cm" />
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <LineChart title="Tractions max" data={pullup} unit=" reps" />
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <LineChart title="Pompes max" data={pushup} unit=" reps" />
      </View>
      <View style={{ marginTop: spacing.lg }}>
        <LineChart title="Poids corporel" data={weight} unit=" kg" />
      </View>

      <Card title="Tests rapides" style={{ marginTop: spacing.lg }}>
        <View style={styles.btnRow}>
          <Button title="CMJ" variant="secondary" onPress={() => router.push('/test/cmj')} style={{ flex: 1 }} />
          <Button title="Tractions max" variant="secondary" onPress={() => router.push('/test/pullup_max')} style={{ flex: 1 }} />
        </View>
        <View style={[styles.btnRow, { marginTop: spacing.sm }]}>
          <Button title="Pompes max" variant="secondary" onPress={() => router.push('/test/pushup_max')} style={{ flex: 1 }} />
          <Button title="Spike Jump" variant="secondary" onPress={() => router.push('/test/spike_jump')} style={{ flex: 1 }} />
        </View>
        <Button title="Pesee" variant="secondary" onPress={() => router.push('/weight')} style={{ marginTop: spacing.sm }} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: spacing.sm },
});
