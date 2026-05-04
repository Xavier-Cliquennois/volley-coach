import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { Card } from '@/components/Card';
import { getRecentJournal, getRecentSessions } from '@/db/queries';
import { JournalRow, SessionRow } from '@/db/schema';
import { colors, spacing } from '@/theme';

const TYPE_LABEL = { A: 'Upper', B: 'Lower', C: 'Full-body' };

export default function Journal() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [entries, setEntries] = useState<JournalRow[]>([]);

  const load = useCallback(async () => {
    setSessions(await getRecentSessions(40));
    setEntries(await getRecentJournal(40));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Journal</Text>
      <Text style={styles.section}>Seances recentes</Text>
      {sessions.length === 0 ? (
        <Text style={styles.muted}>Aucune seance enregistree</Text>
      ) : (
        sessions.map((s) => (
          <Card
            key={s.id}
            title={`${format(parseISO(s.scheduled_date), 'dd/MM')} - Seance ${s.type} (${TYPE_LABEL[s.type]})`}
            subtitle={
              s.completed_at
                ? `Faite - sem ${s.week} phase ${s.phase}${s.duration_seconds ? ` - ${Math.round(s.duration_seconds / 60)}min` : ''}${
                    s.perceived_effort ? ` - RPE ${s.perceived_effort}` : ''
                  }`
                : s.skipped
                ? 'Passee'
                : 'Non terminee'
            }
            style={{ marginTop: spacing.sm }}
          >
            {s.notes && <Text style={styles.body}>{s.notes}</Text>}
          </Card>
        ))
      )}

      <Text style={[styles.section, { marginTop: spacing.xl }]}>Notes / douleurs</Text>
      {entries.length === 0 ? (
        <Text style={styles.muted}>Pas encore de notes</Text>
      ) : (
        entries.map((e) => (
          <Card
            key={e.id}
            subtitle={format(parseISO(e.recorded_at), 'dd/MM HH:mm')}
            style={{ marginTop: spacing.sm }}
          >
            {e.body && <Text style={styles.body}>{e.body}</Text>}
            {e.pain_zones && (
              <Text style={[styles.body, { color: colors.warning }]}>Douleurs: {e.pain_zones}</Text>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  section: { color: colors.textMuted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.lg },
  muted: { color: colors.textMuted, marginTop: spacing.sm },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
});
