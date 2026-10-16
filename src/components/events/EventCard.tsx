import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { rsvpSummary } from '../../utils/rsvp';
import { eventTicketStats } from '../../utils/tickets';
import { countdownLabel, fmtDayNumber, fmtTime } from '../../utils/dates';
import { EVENT_TYPE_LABELS } from '../../utils/events';
import { SmartImage } from '../ui/SmartImage';
import { cx } from '../../utils/styles';

interface EventCardProps {
  event: EventRecord;
  to?: string;
  className?: string;
}

export function EventCard({ event, to, className }: EventCardProps) {
  const db = useDb();
  const isPublic = Boolean(to?.startsWith('/events/'));
  const day = fmtDayNumber(event.startsAt);
  const countdown = countdownLabel(event.startsAt, event.endsAt);
  const flag = event.status === 'draft' ? 'Draft' : event.status === 'cancelled' ? 'Cancelled' : event.status === 'archived' ? 'Archived' : null;

  let meta: string[];
  if (isPublic) {
    meta = [EVENT_TYPE_LABELS[event.type], fmtTime(event.startsAt)];
  } else {
    const rsvp = rsvpSummary(db.guests.filter((g) => g.eventId === event.id));
    const tickets = event.features.tickets ? eventTicketStats(db, event.id) : null;
    const openTasks = db.tasks.filter((t) => t.eventId === event.id && t.status !== 'done').length;
    const team = db.collaborators.filter((c) => c.eventId === event.id).length;
    meta = [
    tickets ? `${tickets.sold}/${tickets.capacity} Tickets` : `${rsvp.headcount}/${rsvp.total} Going`,
    `${openTasks} Open task${openTasks === 1 ? '' : 's'}`,
    `${team} Team`];

  }

  return (
    <Link
      to={to ?? `/app/events/${event.id}`}
      className={cx(
        'group flex h-full flex-col rounded-3xl border border-line bg-white p-2.5 transition duration-300 hover:border-ink/25 hover:shadow-[0_12px_32px_-16px_rgba(16,17,15,0.22)] focus-visible:border-ink',
        className
      )}>
      
      {/* Image — keeps the inset "notch" frame, kept short so photos don't dominate */}
      <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
        <SmartImage src={event.coverUrl} className="transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
        {flag && <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">{flag}</span>}

        {/* Date chip: quiet at rest, comes alive on hover/focus to reveal the countdown */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center overflow-hidden rounded-full bg-white/90 py-1 pl-1 pr-3 text-ink shadow-sm backdrop-blur transition-colors duration-300 group-hover:bg-lime group-focus-visible:bg-lime">
          <span className="flex h-6 items-baseline gap-1 rounded-full bg-ink px-2.5 pt-[4px] text-white">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-coral transition-colors group-hover:text-lime">{day.month}</span>
            <span className="text-[12px] font-semibold tabular-nums leading-none">{day.day}</span>
          </span>
          <span className="ml-2 text-xs font-medium">{day.weekday}</span>
          <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr] group-focus-visible:grid-cols-[1fr]">
            <span className="overflow-hidden whitespace-nowrap text-xs font-medium">
              <span className="px-1.5 text-ink/40" aria-hidden="true">·</span>
              {countdown}
            </span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-2 pb-1.5 pt-3.5">
        <h3 className="line-clamp-1 font-display text-base font-semibold leading-snug text-ink">{event.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-smoke">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{event.venue ? `${event.venue}, ${event.city}` : event.city || 'Location not set'}</span>
        </p>
        <span className="sr-only">{countdown}</span>
        <p className="mt-3 truncate border-t border-line pt-3 text-[13px] tabular-nums text-smoke">
          {meta.map((m, i) =>
          <React.Fragment key={m}>
              {i > 0 && <span className="px-1.5 text-line" aria-hidden="true">·</span>}
              <span className={i === 0 ? 'font-medium text-ink' : undefined}>{m}</span>
            </React.Fragment>
          )}
        </p>
      </div>
    </Link>);

}