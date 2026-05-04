import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { addDays, format, parseISO } from 'date-fns';
import { Button } from '@/components/Button';
import { setPlanState } from '@/db/queries';
import { rescheduleAll } from '@/notifications/scheduler';
import { useSettingsStore } from '@/stores/settingsStore';
import { mondayOf } from '@/domain/schedule';
import { colors, radius, spacing } from '@/theme';
import { GlossaryText } from '@/components/GlossaryText';

const FRENCH_WEEKDAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function formatDateLabel(d: Date): string {
  const wd = FRENCH_WEEKDAYS[d.getDay()];
  return `${wd} ${d.getDate()}/${d.getMonth() + 1}`;
}

export default function Onboarding() {
  const today = new Date();
  const thisMonday = mondayOf(today);
  const [selected, setSelected] = useState<string>(format(thisMonday, 'yyyy-MM-dd'));
  const notifEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const options = [0, 1, 2].map((w) => addDays(thisMonday, w * 7));

  const start = async () => {
    await setPlanState(selected, 0);
    await rescheduleAll({ startDateIso: selected, weekOffset: 0, enabled: notifEnabled });
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Volley Coach</Text>
      <Text style={styles.subtitle}>
        Programme de 12 semaines: force, puissance, detente verticale.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quel lundi demarre la semaine 1 ?</Text>
        <Text style={styles.help}>
          Tes seances tombent le mardi (Upper), jeudi (Lower) et samedi (Full-body).
        </Text>
        {options.map((d) => {
          const iso = format(d, 'yyyy-MM-dd');
          const isSelected = iso === selected;
          return (
            <Button
              key={iso}
              title={formatDateLabel(d)}
              variant={isSelected ? 'primary' : 'secondary'}
              onPress={() => setSelected(iso)}
              style={{ marginTop: spacing.sm }}
            />
          );
        })}
      </View>

      <View style={styles.infoBox}>
        <GlossaryText style={styles.info}>
          Le programme alterne 4 phases (Accumulation, Intensification, Realisation FCM, Deload). Tu retesteras ton CMJ, tractions max et pompes max aux semaines 1, 5, 9 et 12.
        </GlossaryText>
      </View>

      <Button title="Commencer" onPress={start} style={{ marginTop: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xxl * 2,
  },
  title: { color: colors.primary, fontSize: 32, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 16, marginTop: spacing.sm, marginBottom: spacing.xl },
  section: { marginVertical: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  help: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs, marginBottom: spacing.md },
  infoBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  info: { color: colors.text, fontSize: 14, lineHeight: 22 },
});
