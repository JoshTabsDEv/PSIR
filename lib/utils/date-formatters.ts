import { format, parseISO, differenceInYears, isValid } from 'date-fns';

export function formatDateDisplay(date: Date | string | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, 'MMMM d, yyyy');
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, 'yyyy-MM-dd');
}

export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, 'MM/dd/yyyy');
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
