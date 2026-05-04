import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { GLOSSARY } from '@/data/glossary';
import { GlossaryText } from '@/components/GlossaryText';
import { exportAll, getPlanState } from '@/db/queries';
import { resetDb } from '@/db/client';
import { rescheduleAll, clearAllScheduled } from '@/notifications/scheduler';
import { useSettingsStore } from '@/stores/settingsStore';
import { colors, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const tts = useSettingsStore((s) => s.ttsEnabled);
  const setTts = useSettingsStore((s) => s.setTts);
  const sound = useSettingsStore((s) => s.timerSoundEnabled);
  const setSound = useSettingsStore((s) => s.setTimerSound);
  const haptics = useSettingsStore((s) => s.hapticsEnabled);
  const setHaptics = useSettingsStore((s) => s.setHaptics);
  const notifs = useSettingsStore((s) => s.notificationsEnabled);
  const setNotifs = useSettingsStore((s) => s.setNotifications);
  const [exporting, setExporting] = useState(false);

  const handleNotifToggle = async (v: boolean) => {
    await setNotifs(v);
    const plan = await getPlanState();
    if (!plan) return;
    if (v) {
      await rescheduleAll({
        startDateIso: plan.start_date,
        weekOffset: plan.week_offset,
        enabled: true,
      });
    } else {
      await clearAllScheduled();
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportAll();
      const json = JSON.stringify(data, null, 2);
      const path = `${FileSystem.documentDirectory}volley-coach-export-${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert('Export sauvegarde', `Fichier: ${path}`);
      }
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reinitialiser tout',
      'Cela supprime toutes les donnees (seances, tests, journal). Irreversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            await resetDb();
            await clearAllScheduled();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reglages</Text>

      <Card title="Audio" style={{ marginTop: spacing.md }}>
        <Row label="Synthese vocale (TTS)" value={tts} onChange={setTts} />
        <Row label="Son fin de timer" value={sound} onChange={setSound} />
        <Row label="Vibrations (haptics)" value={haptics} onChange={setHaptics} />
      </Card>

      <Card title="Notifications" subtitle="Mardi/Jeudi 11h, Samedi 13h" style={{ marginTop: spacing.md }}>
        <Row label="Notifications activees" value={notifs} onChange={handleNotifToggle} />
      </Card>

      <Card title="Donnees" style={{ marginTop: spacing.md }}>
        <Button
          title={exporting ? 'Export en cours...' : 'Exporter en JSON'}
          variant="secondary"
          onPress={handleExport}
          disabled={exporting}
        />
        <Button
          title="Reinitialiser le programme"
          variant="danger"
          onPress={handleReset}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      <Card title="Glossaire" subtitle="Tape sur un terme pour la definition" style={{ marginTop: spacing.md }}>
        <View style={styles.tagWrap}>
          {GLOSSARY.map((g) => (
            <View key={g.slug} style={styles.tag}>
              <GlossaryText style={styles.tagText}>{g.label}</GlossaryText>
            </View>
          ))}
        </View>
      </Card>

      <Text style={styles.footer}>v1.0 - 100% local</Text>
    </ScrollView>
  );
}

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.bg : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: { color: colors.text, fontSize: 15, flex: 1 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tagText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  footer: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: spacing.xl },
});
