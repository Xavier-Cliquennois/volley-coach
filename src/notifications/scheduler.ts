import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { addDays, parseISO, setHours, setMinutes, setSeconds, startOfDay } from 'date-fns';
import { generateUpcomingSessions, isTestWeek } from '@/domain/schedule';
import { NOTIFICATION_HOUR } from '@/data/program';

/**
 * In Expo Go (SDK 53+) push/remote notifications are not supported. Local
 * scheduled notifications still work, but to avoid noise in the console we
 * skip everything in Expo Go and rely on a real dev/standalone build for
 * actual notifications.
 */
const IS_EXPO_GO = Constants.appOwnership === 'expo';

let handlerSet = false;
function ensureHandler(): void {
  if (IS_EXPO_GO || handlerSet) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerSet = true;
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (IS_EXPO_GO) return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const requested = await Notifications.requestPermissionsAsync({
    android: {},
    ios: { allowAlert: true, allowSound: true },
  });
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (IS_EXPO_GO || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Volley Coach',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#22D3EE',
  });
}

export async function clearAllScheduled(): Promise<void> {
  if (IS_EXPO_GO) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

type ScheduleParams = {
  startDateIso: string;
  weekOffset: number;
  enabled: boolean;
};

/**
 * Wipes all scheduled notifications and reschedules:
 *  - upcoming sessions (Tue/Thu 11:00, Sat 13:00)
 *  - test reminders (day before at 19:00 on test weeks)
 *  - weekly weigh-in (Sunday 10:00)
 *
 * No-op in Expo Go.
 */
export async function rescheduleAll({
  startDateIso,
  weekOffset,
  enabled,
}: ScheduleParams): Promise<void> {
  if (IS_EXPO_GO) {
    console.log('[notifications] skipped (Expo Go - use a dev build)');
    return;
  }
  ensureHandler();
  await clearAllScheduled();
  if (!enabled) return;
  const granted = await ensureNotificationPermissions();
  if (!granted) return;
  await ensureAndroidChannel();

  const now = new Date();
  const upcoming = generateUpcomingSessions(now, startDateIso, weekOffset, 30);

  for (const occ of upcoming) {
    if (!occ.sessionType || !occ.week) continue;
    const { hour, minute } = NOTIFICATION_HOUR[occ.sessionType];
    const trigger = atTime(parseISO(occ.isoDate), hour, minute);
    if (trigger <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Seance ${occ.sessionType} - Semaine ${occ.week} (Phase ${occ.phase})`,
        body: 'C\'est l\'heure de l\'entrainement. Ouvre l\'app pour demarrer.',
        data: { kind: 'session', date: occ.isoDate },
      },
      trigger: trigger,
    });

    if (occ.week && isTestWeek(occ.week) && occ.sessionType === 'A') {
      const reminderDate = atTime(addDays(parseISO(occ.isoDate), -1), 19, 0);
      if (reminderDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Tests demain',
            body: `Pense au CMJ, tractions max et pompes max avant la seance ${occ.sessionType}.`,
            data: { kind: 'tests', week: occ.week },
          },
          trigger: reminderDate,
        });
      }
    }
  }

  for (let i = 0; i < 90; i++) {
    const day = addDays(now, i);
    if (day.getDay() === 0) {
      const trigger = atTime(day, 10, 0);
      if (trigger <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pesee hebdomadaire',
          body: 'Note ton poids dans l\'app pour suivre ton evolution.',
          data: { kind: 'weight' },
        },
        trigger: trigger,
      });
    }
  }
}

function atTime(day: Date, hour: number, minute: number): Date {
  const base = startOfDay(day);
  return setSeconds(setMinutes(setHours(base, hour), minute), 0);
}
