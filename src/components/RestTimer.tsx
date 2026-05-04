import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '@/theme';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTTS } from '@/hooks/useTTS';

type Props = {
  durationSeconds: number;
  onComplete: () => void;
  onSkip: () => void;
};

function formatMMSS(s: number): string {
  const total = Math.max(0, Math.floor(s));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function RestTimer({ durationSeconds, onComplete, onSkip }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const completedRef = useRef(false);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const timerSoundEnabled = useSettingsStore((s) => s.timerSoundEnabled);
  const { speak } = useTTS();

  useEffect(() => {
    setRemaining(durationSeconds);
    completedRef.current = false;
  }, [durationSeconds]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        if (next <= 0 && !completedRef.current) {
          completedRef.current = true;
          if (hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          if (timerSoundEnabled) speak('Go');
          onComplete();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hapticsEnabled, timerSoundEnabled, speak, onComplete]);

  const overdue = remaining <= 0;
  const progress = Math.min(1, 1 - remaining / durationSeconds);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Repos</Text>
      <Text style={[styles.time, overdue && { color: colors.success }]}>
        {formatMMSS(overdue ? 0 : remaining)}
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Pressable style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Passer le repos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: { color: colors.textMuted, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  time: { color: colors.primary, fontSize: 56, fontWeight: '800', fontVariant: ['tabular-nums'] },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  skipButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  skipText: { color: colors.textMuted, fontSize: 14 },
});
