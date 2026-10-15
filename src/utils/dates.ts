import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns';

export function fmtDate(iso: string): string {
  return format(parseISO(iso), 'EEE, d MMM yyyy');
}

export function fmtShortDate(iso: string): string {
  return format(parseISO(iso), 'd MMM');
}

export function fmtTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a');
}

export function fmtDateTime(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy, h:mm a");
}

export function fmtDayNumber(iso: string): {day: string;month: string;weekday: string;} {
  const d = parseISO(iso);
  return { day: format(d, 'd'), month: format(d, 'MMM'), weekday: format(d, 'EEE') };
}

export function daysUntil(iso: string, now: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(iso), now);
}

export function dueLabel(iso: string, now: Date = new Date()): string {
  const d = daysUntil(iso, now);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d === -1) return 'yesterday';
  if (d > 1) return `in ${d} days`;
  return `${Math.abs(d)} days ago`;
}

export function countdownLabel(startIso: string, endIso: string, now: Date = new Date()): string {
  if (parseISO(endIso) < now) return 'Event ended';
  const d = daysUntil(startIso, now);
  if (d <= 0) return 'Happening today';
  if (d === 1) return 'Tomorrow';
  return `${d} days to go`;
}

export function timeAgo(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
}

export function toDateInput(iso: string | null): string {
  return iso ? format(parseISO(iso), 'yyyy-MM-dd') : '';
}

export function toTimeInput(iso: string | null): string {
  return iso ? format(parseISO(iso), 'HH:mm') : '';
}

/** Combine yyyy-MM-dd and HH:mm (local, Africa/Lagos assumed) into ISO. */
export function combineDateTime(date: string, time: string): string {
  return new Date(`${date}T${time || '12:00'}:00`).toISOString();
}

export function isPast(iso: string, now: Date = new Date()): boolean {
  return parseISO(iso) < now;
}