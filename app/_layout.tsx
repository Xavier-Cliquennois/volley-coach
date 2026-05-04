import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDb } from '@/db/client';
import { useSettingsStore } from '@/stores/settingsStore';
import { colors, spacing } from '@/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadSettings = useSettingsStore((s) => s.load);

  useEffect(() => {
    (async () => {
      try {
        await getDb();
        await loadSettings();
        setReady(true);
      } catch (e) {
        const msg = e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e);
        console.error('Boot error:', msg);
        setError(msg);
        setReady(true);
      }
    })();
  }, [loadSettings]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Initialisation...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.errorContainer}>
        <Text style={styles.errorTitle}>Erreur au demarrage</Text>
        <Text style={styles.errorBody}>{error}</Text>
      </ScrollView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="session/[date]" options={{ title: 'Seance en cours' }} />
        <Stack.Screen name="session/summary" options={{ title: 'Recap' }} />
        <Stack.Screen name="exercise/[slug]" options={{ title: 'Exercice' }} />
        <Stack.Screen name="test/[type]" options={{ title: 'Test' }} />
        <Stack.Screen name="weight" options={{ title: 'Pesee' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: { color: colors.textMuted, fontSize: 14 },
  errorContainer: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xxl * 2,
  },
  errorTitle: { color: colors.danger, fontSize: 22, fontWeight: '800', marginBottom: spacing.md },
  errorBody: { color: colors.text, fontSize: 12, fontFamily: 'monospace' },
});
