import { create } from 'zustand';
import { getSettings, updateSettings } from '@/db/queries';

type SettingsState = {
  loaded: boolean;
  ttsEnabled: boolean;
  timerSoundEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  load: () => Promise<void>;
  setTts: (v: boolean) => Promise<void>;
  setTimerSound: (v: boolean) => Promise<void>;
  setHaptics: (v: boolean) => Promise<void>;
  setNotifications: (v: boolean) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  loaded: false,
  ttsEnabled: true,
  timerSoundEnabled: true,
  hapticsEnabled: true,
  notificationsEnabled: true,
  load: async () => {
    const row = await getSettings();
    set({
      loaded: true,
      ttsEnabled: !!row.tts_enabled,
      timerSoundEnabled: !!row.timer_sound_enabled,
      hapticsEnabled: !!row.haptics_enabled,
      notificationsEnabled: !!row.notifications_enabled,
    });
  },
  setTts: async (v) => {
    await updateSettings({ tts_enabled: v ? 1 : 0 });
    set({ ttsEnabled: v });
  },
  setTimerSound: async (v) => {
    await updateSettings({ timer_sound_enabled: v ? 1 : 0 });
    set({ timerSoundEnabled: v });
  },
  setHaptics: async (v) => {
    await updateSettings({ haptics_enabled: v ? 1 : 0 });
    set({ hapticsEnabled: v });
  },
  setNotifications: async (v) => {
    await updateSettings({ notifications_enabled: v ? 1 : 0 });
    set({ notificationsEnabled: v });
  },
}));
