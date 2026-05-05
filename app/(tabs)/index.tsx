import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { addDays, format, parseISO } from 'date-fns';
import {
  bumpWeekOffset,
  findSessionByDate,
  getCompletedSessionCount,
  getLatestTest,
  getPlanState,
  getRecentSessions,
} from '@/db/queries';
import { findNextSession, isTestWeek, resolveDate } from '@/domain/schedule';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, radius, spacing } from '@/theme';
import { rescheduleAll } from '@/notifications/scheduler';
import { useSettingsStore } from '@/stores/settingsStore';
import { PHASE_DESCRIPTION } from '@/data/program';

const SESSION_TITLES = { A: 'Upper Power & Core', B: 'Lower Strength & Plyo', C: 'Full-body Power' } as const;
const FRENCH_DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function Today() {
  const [planLoaded, setPlanLoaded] = useState(false);
  const [planMissing, setPlanMissing] = useState(false);
  const [todayInfo, setTodayInfo] = useState<{
    isoDate: string;
    week: number | null;
    phase: number | null;
    sessionType: 'A' | 'B' | 'C' | null;
    completed: boolean;
    skipped: boolean;
  } | null>(null);
  const [nextSession, setNextSession] = useState<{ isoDate: string; week: number; type: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [latestCmj, setLatestCmj] = useState<number | null>(null);
  const [latestPullup, setLatestPullup] = useState<number | null>(null);
  const notifEnabled = useSettingsStore((s) => s.notificationsEnabled);

  const loadData = useCallback(async () => {
    const plan = await getPlanState();
    if (!plan) {
      setPlanMissing(true);
      setPlanLoaded(true);
      return;
    }
    setPlanMissing(false);

    const now = new Date();
    const todayRes = resolveDate(now, plan.start_date, plan.week_offset);
    const existingToday = await findSessionByDate(todayRes.isoDate);
    setTodayInfo({
      isoDate: todayRes.isoDate,
      week: todayRes.week,
      phase: todayRes.phase,
      sessionType: todayRes.sessionType,
      completed: !!existingToday?.completed_at,
      skipped: !!existingToday?.skipped,
    });

    const next = findNextSession(addDays(now, 1), plan.start_date, plan.week_offset);
    if (next?.week && next.sessionType) {
      setNextSession({ isoDate: next.isoDate, week: next.week, type: next.sessionType });
    } else {
      setNextSession(null);
    }

    const completed = await getCompletedSessionCount();
    setStreak(completed);

    const cmj = await getLatestTest('cmj');
    setLatestCmj(cmj?.value ?? null);
    const pullup = await getLatestTest('pullup_max');
    setLatestPullup(pullup?.value ?? null);

    setPlanLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!planLoaded) {
    return <View style={styles.loading} />;
  }

  if (planMissing) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Bienvenue</Text>
        <Button
          title="Configurer le programme"
          onPress={() => router.push('/onboarding')}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  const todayLabel = todayInfo
    ? `${FRENCH_DOW[parseISO(todayInfo.isoDate).getDay()]} ${format(parseISO(todayInfo.isoDate), 'dd/MM')}`
    : '';

  const showTestReminder = todayInfo?.week && isTestWeek(todayInfo.week) && todayInfo.sessionType === 'A';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.dateLabel}>{todayLabel}</Text>
      {todayInfo?.week && todayInfo.phase ? (
        <Text style={styles.weekLabel}>
          Semaine {todayInfo.week} / 12 - Phase {todayInfo.phase} ({PHASE_DESCRIPTION[todayInfo.phase as 1 | 2 | 3 | 4].name})
        </Text>
      ) : (
        <Text style={styles.weekLabel}>Hors programme</Text>
      )}

      {showTestReminder && (
        <Card title="Tests cette semaine" style={{ marginTop: spacing.lg, borderColor: colors.warning }}>
          <Text style={styles.cardBody}>
            C'est une semaine de test. Mesure ton CMJ avec My Jump 2, ton max de tractions et ton max de pompes.
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <Button title="CMJ" variant="secondary" onPress={() => router.push('/test/cmj')} style={{ flex: 1 }} />
            <Button title="Tractions" variant="secondary" onPress={() => router.push('/test/pullup_max')} style={{ flex: 1 }} />
            <Button title="Pompes" variant="secondary" onPress={() => router.push('/test/pushup_max')} style={{ flex: 1 }} />
          </View>
        </Card>
      )}

      {todayInfo?.sessionType && todayInfo.week ? (
        <Card
          title={`Seance ${todayInfo.sessionType} - ${SESSION_TITLES[todayInfo.sessionType]}`}
          subtitle={
            todayInfo.completed
              ? 'Deja realisee aujourd\'hui'
              : todayInfo.skipped
              ? 'Marquee comme passee'
              : 'A faire aujourd\'hui'
          }
          style={{ marginTop: spacing.lg }}
        >
          {!todayInfo.completed && (
            <Button
              title={todayInfo.skipped ? 'Faire la seance maintenant' : 'Demarrer la seance'}
              onPress={() => router.push(`/session/${todayInfo.isoDate}`)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </Card>
      ) : (
        <Card title="Pas de seance aujourd'hui" subtitle="Profite pour recuperer ou faire de la mobilite legere" style={{ marginTop: spacing.lg }} />
      )}

      {nextSession && (
        <Card
          title="Prochaine seance"
          subtitle={`${FRENCH_DOW[parseISO(nextSession.isoDate).getDay()]} ${format(
            parseISO(nextSession.isoDate),
            'dd/MM'
          )} - Seance ${nextSession.type}`}
          style={{ marginTop: spacing.lg }}
        />
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Seances faites</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{latestCmj != null ? `${latestCmj.toFixed(1)}` : '-'}</Text>
          <Text style={styles.statLabel}>CMJ (cm)</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{latestPullup != null ? latestPullup : '-'}</Text>
          <Text style={styles.statLabel}>Tractions max</Text>
        </View>
      </View>

      <Card title="Decaler le planning" subtitle="Si tu veux refaire cette semaine la semaine prochaine" style={{ marginTop: spacing.lg }}>
        <Button
          title="Decaler tout de +1 semaine"
          variant="secondary"
          onPress={async () => {
            await bumpWeekOffset(1);
            const plan = await getPlanState();
            if (plan) {
              await rescheduleAll({
                startDateIso: plan.start_date,
                weekOffset: plan.week_offset,
                enabled: notifEnabled,
              });
            }
            loadData();
          }}
          style={{ marginTop: spacing.sm }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 24, fontWeight: '700' },
  dateLabel: { color: colors.textMuted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  weekLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
  cardBody: { color: colors.text, fontSize: 14, lineHeight: 20 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
});
