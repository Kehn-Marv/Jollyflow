import type { useDb } from '../contexts/DataContext';
import type { EventRecord } from '../types/domain';
import { rsvpSummary } from './rsvp';
import { fmtDate, fmtDateTime, fmtTime } from './dates';
import { BOOKING_STATUS_LABELS, EVENT_TYPE_LABELS, ROLE_LABELS } from './events';

type Db = ReturnType<typeof useDb>;

/** Plain-text summary of one event — safe to share, nothing from other events. */
export function buildEventReport(db: Db, event: EventRecord): string {
  const guests = db.guests.filter((g) => g.eventId === event.id);
  const rsvp = rsvpSummary(guests);
  const tasks = db.tasks.filter((t) => t.eventId === event.id);
  const open = tasks.filter((t) => t.status !== 'done');
  const team = db.collaborators.filter((c) => c.eventId === event.id);
  const bookings = db.bookings.filter((b) => b.eventId === event.id);
  const line = '─'.repeat(44);

  const out = [
  'JOLLIFLOW — EVENT REPORT',
  line,
  event.title,
  `${EVENT_TYPE_LABELS[event.type]} · ${event.status}`,
  `${fmtDate(event.startsAt)} · ${fmtTime(event.startsAt)}–${fmtTime(event.endsAt)}`,
  event.venue ? `${event.venue}, ${event.city}` : 'Location not set',
  '',
  'GUESTS',
  `Invited ${rsvp.total} · Attending ${rsvp.attending} · Pending ${rsvp.pending} · Declined ${rsvp.declined}`,
  `Expected headcount: ${rsvp.headcount}`,
  '',
  `TASKS (${tasks.length - open.length}/${tasks.length} done)`,
  ...(open.length ? open.map((t) => `  [ ] ${t.title}${t.dueDate ? ` — due ${fmtDate(t.dueDate)}` : ''}`) : ['  All tasks complete']),
  '',
  'VENDORS',
  ...(bookings.length ?
  bookings.map((b) => `  • ${db.vendors.find((v) => v.id === b.vendorId)?.name ?? 'Vendor'} — ${b.serviceName} (${BOOKING_STATUS_LABELS[b.status]})`) :
  ['  No vendors booked']),
  '',
  'PLANNERS',
  ...team.map((c) => `  • ${c.name} — ${c.role === 'owner' ? 'Creator' : ROLE_LABELS[c.role]}${c.phone ? ` · ${c.phone}` : ''}`),
  '',
  line,
  `Generated ${fmtDateTime(new Date().toISOString())} · Demo data`];

  return out.join('\n');
}

export function downloadEventReport(db: Db, event: EventRecord) {
  const blob = new Blob([buildEventReport(db, event)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.slug || event.id}-report.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}