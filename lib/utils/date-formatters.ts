import { format, parseISO, differenceInYears, isValid, formatDistanceToNow } from 'date-fns';

/**
 * Calendar dates are picked in the browser at Philippine local midnight and
 * stored as UTC instants (e.g. Oct 6 PHT -> 2026-10-05T16:00:00Z). Exports run
 * on the server, which is UTC on Vercel, so formatting in the server's local
 * zone printed the previous day. Always resolve the calendar day in PHT.
 */
export const APP_TIME_ZONE = 'Asia/Manila';

/** Re-anchors a date so its local Y/M/D equal the Philippine calendar day. */
function toAppCalendarDate(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(get('year'), get('month') - 1, get('day'));
}

function formatCalendarDate(date: Date | string | null | undefined, pattern: string): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(toAppCalendarDate(parsedDate), pattern);
}

export function formatDateDisplay(date: Date | string | null | undefined): string {
  return formatCalendarDate(date, 'MMMM d, yyyy');
}

export function formatDateInput(date: Date | string | null | undefined): string {
  return formatCalendarDate(date, 'yyyy-MM-dd');
}

export function formatDateShort(date: Date | string | null | undefined): string {
  return formatCalendarDate(date, 'MM/dd/yyyy');
}

export function calculateAge(birthday: Date | string | null | undefined): number {
  if (!birthday) return 0;
  const parsedDate = typeof birthday === 'string' ? parseISO(birthday) : birthday;
  if (!isValid(parsedDate)) return 0;
  return differenceInYears(new Date(), parsedDate);
}

export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  const parsed = parseISO(dateString);
  return isValid(parsed) ? parsed : null;
}

export function isValidDate(date: unknown): boolean {
  if (!date) return false;
  if (date instanceof Date) return isValid(date);
  if (typeof date === 'string') return isValid(parseISO(date));
  return false;
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

