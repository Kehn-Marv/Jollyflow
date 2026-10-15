import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { summariseEvent } from '../../utils/finance';
import { rsvpSummary } from '../../utils/rsvp';
import { eventTicketStats } from '../../utils/tickets';
import { countdownLabel, fmtDayNumber } from '../../utils/dates';
import { EVENT_TYPE_LABELS } from '../../utils/events';
import { percent } from '../../utils/money';
import { StatusPill } from '../ui/StatusPill';
import { cx } from '../../utils/styles';

interface EventCardProps {
  event: EventRecord;
  to?: string;
  className?: string;
}

export function EventCard({ event, to, className }: EventCardProps) {
  const db = useDb();
  const fin = summariseEvent(db, event.id);
  const rsvp = rsvpSummary(db.guests.filter((g) => g.eventId === event.id));
  const openTasks = db.tasks.filter((t) => t.eventId === event.id && t.status !== 'done').length;
  const tickets = event.features.tickets ? eventTicketStats(db, event.id) : null;
  const day = fmtDayNumber(event.startsAt);

  return (
    <Link
      to={to ?? `/app/events/${event.id}`}
      className={cx('group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-pop', className)}>
      
      <div className="relative aspect-[16/9] overflow-hidden bg-sand">
        <img src={event.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <StatusPill tone="dark">{EVENT_TYPE_LABELS[event.type]}</StatusPill>
          {event.status === 'draft' && <StatusPill tone="lime">Draft</StatusPill>}
          {event.status === 'cancelled' && <StatusPill tone="danger">Cancelled</StatusPill>}
          {event.status === 'archived' && <StatusPill>Archived</StatusPill>}
        </div>
        <div className="absolute bottom-3 right-3 min-w-[3.25rem] rounded-xl border-2 border-ink bg-paper px-2 py-1 text-center leading-none shadow-pop-sm">
          <span className="block text-[10px] font-semibold uppercase text-smoke">{day.month}</span>
          <span className="block font-display text-xl font-bold text-ink">{day.day}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-coral">{countdownLabel(event.startsAt, event.endsAt)}</p>
        <h3 className="mt-1 line-clamp-1 font-display text-lg font-semibold leading-snug text-ink">{event.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-smoke">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{event.venue}, {event.city}</span>
        </p>
        <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-3 text-sm [&>div]:min-w-0">
          <div className="mt-3">
            <dt className="text-xs text-smoke">{tickets ? 'Tickets' : 'Going'}</dt>
            <dd className="truncate font-semibold tabular-nums text-ink">{tickets ? `${tickets.sold}/${tickets.capacity}` : `${rsvp.headcount} of ${rsvp.total}`}</dd>
          </div>
          <div className="mt-3">
            <dt className="text-xs text-smoke">Open tasks</dt>
            <dd className="font-semibold tabular-nums text-ink">{openTasks}</dd>
          </div>
          <div className="mt-3">
            <dt className="text-xs text-smoke">Committed</dt>
            <dd className={cx('font-semibold tabular-nums', fin.overCommitted ? 'text-danger' : 'text-ink')}>{fin.budget ? `${percent(fin.committed, fin.budget)}%` : '—'}</dd>
          </div>
        </dl>
      </div>
    </Link>);

}