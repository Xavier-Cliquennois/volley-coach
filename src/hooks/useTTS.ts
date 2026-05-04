import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useSettingsStore } from '@/stores/settingsStore';

export function useTTS() {
  const ttsEnabled = useSettingsStore((s) => s.ttsEnabled);

  const speak = useCallback(
    (text: string, opts?: Speech.SpeechOptions) => {
      if (!ttsEnabled || !text) return;
      Speech.stop();
      Speech.speak(text, { language: 'fr-FR', rate: 1, pitch: 1, ...opts });
    },
    [ttsEnabled]
  );

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { speak, stop, enabled: ttsEnabled };
}
