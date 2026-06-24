/**
 * Fellowship application window.
 *
 * Applications are accepted only during two yearly windows (inclusive),
 * evaluated in India Standard Time (Asia/Kolkata):
 *   - 1st–15th February
 *   - 1st–15th August
 *
 * Used by both the page (to show the form vs a "closed" message) and the
 * server action (to reject out-of-window submissions), so UI and enforcement
 * can never disagree.
 *
 * Escape hatch: set env FELLOWSHIP_WINDOW_OVERRIDE to `open` or `closed` to
 * force the window state without a code change. Leave it unset for the normal
 * date-based behaviour.
 */

const TIME_ZONE = 'Asia/Kolkata';

// Inclusive day ranges per month (month is 1-based).
const WINDOWS = [
  { month: 2, startDay: 1, endDay: 15 }, // February
  { month: 8, startDay: 1, endDay: 15 }, // August
] as const;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Human-readable description of the windows, for page copy. */
export const FELLOWSHIP_WINDOW_DESCRIPTION =
  '1st–15th February and 1st–15th August';

function istParts(date: Date): { year: number; month: number; day: number } {
  // 'en-CA' formats as YYYY-MM-DD, which is trivial to split.
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const [year, month, day] = formatted.split('-').map(Number);
  return { year, month, day };
}

/** True if applications are currently open. */
export function isFellowshipWindowOpen(now: Date = new Date()): boolean {
  const override = process.env.FELLOWSHIP_WINDOW_OVERRIDE?.toLowerCase();
  if (override === 'open') return true;
  if (override === 'closed') return false;

  const { month, day } = istParts(now);
  return WINDOWS.some(
    (w) => month === w.month && day >= w.startDay && day <= w.endDay,
  );
}

/**
 * Friendly label for the next date the window opens, e.g. "1 August 2026".
 * Used in the "applications are closed" message.
 */
export function getNextWindowLabel(now: Date = new Date()): string {
  const { year, month, day } = istParts(now);
  const currentMd = month * 100 + day;

  // Candidate openings in chronological order (day 1 of each window month).
  const openings = [
    { y: year, m: 2 },
    { y: year, m: 8 },
    { y: year + 1, m: 2 },
  ];

  for (const o of openings) {
    const openingMd = o.m * 100 + 1;
    if (o.y > year || openingMd > currentMd) {
      return `1 ${MONTH_NAMES[o.m - 1]} ${o.y}`;
    }
  }
  // Unreachable in practice, but keep a sensible fallback.
  return `1 ${MONTH_NAMES[1]} ${year + 1}`;
}
