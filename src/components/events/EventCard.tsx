import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { rsvpSummary } from '../../utils/rsvp';
import { eventTicketStats } from '../../utils/tickets';
import { countdownLabel, fmtDayNumber } from '../../utils/dates';
import { EVENT_TYPE_LABELS } from '../../utils/events';
import { cx } from '../../utils/styles';

interface EventCardProps {
  event: EventRecord;
  to?: string;
  className?: string;
}

export function EventCard({ event, to, className }: EventCardProps) {
  const db = useDb();
  const rsvp = rsvpSummary(db.guests.filter((g) => g.eventId === event.id));
  const openTasks = db.tasks.filter((t) => t.eventId === event.id && t.status !== 'done').length;
  const team = db.collaborators.filter((c) => c.eventId === event.id).length;
  const tickets = event.features.tickets ? eventTicketStats(db, event.id) : null;
  const day = fmtDayNumber(event.startsAt);
  const flag = event.status === 'draft' ? 'Draft' : event.status === 'cancelled' ? 'Cancelled' : event.status === 'archived' ? 'Archived' : null;

  return (
    <Link
      to={to ?? `/app/events/${event.id}`}
      className={cx('group flex flex-col rounded-3xl border border-line bg-white p-3 transition duration-200 hover:border-ink/30 hover:shadow-[0_8px_30px_-12px_rgba(16,17,15,0.18)]', className)}>
      
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand">
        <img src={event.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
        {flag && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink backdrop-blur">{flag}</span>}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-start gap-3">
          <div className="w-10 shrink-0 text-center leading-none">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-coral">{day.month}</span>
            <span className="mt-0.5 block font-display text-2xl font-semibold text-ink">{day.day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 font-display text-base font-semibold leading-snug text-ink">{event.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-smoke">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{event.venue}, {event.city}</span>
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2 text-xs text-smoke">
          <span>{EVENT_TYPE_LABELS[event.type]} · {countdownLabel(event.startsAt, event.endsAt)}</span>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line/70 pt-3 text-xs">
          <div className="min-w-0">
            <dt className="text-smoke">{tickets ? 'Tickets' : 'Going'}</dt>
            <dd className="mt-0.5 truncate text-sm font-medium tabular-nums text-ink">{tickets ? `${tickets.sold}/${tickets.capacity}` : `${rsvp.headcount}/${rsvp.total}`}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-smoke">Open tasks</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{openTasks}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-smoke">Team</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums text-ink">{team}</dd>
          </div>
        </dl>
      </div>
    </Link>);

}