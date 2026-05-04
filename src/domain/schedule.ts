import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { PHASE_FOR_WEEK, SESSION_SCHEDULE, SessionType, TOTAL_WEEKS } from '@/data/program';

export type ScheduleResolution = {
  /** Calendar date the user is asking about. */
  date: Date;
  /** 1-indexed program week (or null if outside the 12-week plan). */
  week: number | null;
  /** Phase for that week (1-4) or null. */
  phase: number | null;
  /** Session type scheduled for that day, or null on rest days. */
  sessionType: SessionType | null;
  /** ISO date string, day-precision (YYYY-MM-DD). */
  isoDate: string;
};

/**
 * Resolves which program week + session corresponds to a given calendar date,
 * accounting for any user-applied week offset (push planning by N weeks).
 */
export function resolveDate(
  date: Date,
  startDateIso: string,
  weekOffset: number
): ScheduleResolution {
  const isoDate = format(date, 'yyyy-MM-dd');
  const start = parseISO(startDateIso);
  const daysSinceStart = differenceInCalendarDays(startOfDay(date), startOfDay(start));
  const dow = date.getDay();
  const sessionType = SESSION_SCHEDULE[dow] ?? null;

  if (daysSinceStart < 0) {
    return { date, week: null, phase: null, sessionType, isoDate };
  }

  const calendarWeekIndex = Math.floor(daysSinceStart / 7);
  const programWeekIndex = calendarWeekIndex - weekOffset;
  if (programWeekIndex < 0) {
    return { date, week: null, phase: null, sessionType, isoDate };
  }
  const week = programWeekIndex + 1;
  if (week > TOTAL_WEEKS) {
    return { date, week: null, phase: null, sessionType, isoDate };
  }

  return {
    date,
    week,
    phase: PHASE_FOR_WEEK[week] ?? null,
    sessionType,
    isoDate,
  };
}

/** Find the next session day from `from` (inclusive). Returns null if program is over. */
export function findNextSession(
  from: Date,
  startDateIso: string,
  weekOffset: number
): ScheduleResolution | null {
  for (let i = 0; i < 14; i++) {
    const day = addDays(from, i);
    const res = resolveDate(day, startDateIso, weekOffset);
    if (res.week && res.sessionType) {
      return res;
    }
  }
  return null;
}

/** Returns the Monday of the calendar week containing `date`. */
export function mondayOf(date: Date): Date {
  const dow = date.getDay();
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  return addDays(date, diffToMonday);
}

/** Generate all upcoming session occurrences from `from` until program ends. */
export function generateUpcomingSessions(
  from: Date,
  startDateIso: string,
  weekOffset: number,
  maxOccurrences = 60
): ScheduleResolution[] {
  const out: ScheduleResolution[] = [];
  // Stop only when we've passed the end of the 12-week program. A null week
  // before the program starts (waiting period) must not break the loop.
  const start = parseISO(startDateIso);
  for (let i = 0; i < 365; i++) {
    if (out.length >= maxOccurrences) break;
    const day = addDays(from, i);
    const res = resolveDate(day, startDateIso, weekOffset);
    if (res.week && res.sessionType) {
      out.push(res);
    }
    const daysSinceStart = differenceInCalendarDays(startOfDay(day), startOfDay(start));
    if (res.week === null && daysSinceStart >= 0) {
      // Past the program end — safe to stop.
      break;
    }
  }
  return out;
}

/** Test weeks: 0 (initial), 4, 8, 12. We schedule reminders the day BEFORE at 19:00. */
export const TEST_WEEKS = [1, 5, 9, 12];

export function isTestWeek(week: number): boolean {
  return TEST_WEEKS.includes(week);
}
