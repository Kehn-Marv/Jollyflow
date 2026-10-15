import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { computeInsights } from '../../utils/insights';
import { bookingFinance, summariseEvent } from '../../utils/finance';
import { rsvpSummary } from '../../utils/rsvp';
import { eventTicketStats } from '../../utils/tickets';
import { dueLabel, isPast } from '../../utils/dates';
import { formatNaira } from '../../utils/money';
import { BOOKING_STATUS_LABELS } from '../../utils/events';
import { InsightCard } from '../insights/InsightCard';
import { BudgetMeter } from '../money/BudgetMeter';
import { RsvpRing } from '../guests/RsvpRing';
import { ActivityFeed } from '../activity/ActivityFeed';
import { ProgressBar } from '../ui/ProgressBar';
import { BOOKING_TONE, StatusPill } from '../ui/StatusPill';
import { cx } from '../../utils/styles';

function Panel({ title, to, linkLabel, children, className }: {title: string;to?: string;linkLabel?: string;children: React.ReactNode;className?: string;}) {
  return (
    <section className={cx('rounded-[1.4rem] border border-line bg-white p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {to && <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:underline">{linkLabel ?? 'Open'} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
      </div>
      <div className="mt-4">{children}</div>
    </section>);

}

export function OverviewTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const base = `/app/events/${event.id}`;
  const insights = computeInsights(db, new Date(), event.id);
  const fin = summariseEvent(db, event.id);
  const tasks = db.tasks.filter((t) => t.eventId === event.id);
  const done = tasks.filter((t) => t.status === 'done').length;
  const nextTasks = tasks.filter((t) => t.status !== 'done').sort((a, b) => (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9')).slice(0, 4);
  const rsvp = rsvpSummary(db.guests.filter((g) => g.eventId === event.id));
  const tickets = event.features.tickets ? eventTicketStats(db, event.id) : null;
  const bookings = db.bookings.filter((b) => b.eventId === event.id && b.status !== 'cancelled' && b.status !== 'declined').slice(0, 4);
  const activity = db.activities.filter((a) => a.eventId === event.id).slice(0, 6);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <section className="on-dark rounded-[1.4rem] bg-ink p-5 text-paper">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Next steps</h2>
            <span className="text-xs text-paper/55">Rule-based</span>
          </div>
          {insights.length ?
          <ul className="mt-3 space-y-1">{insights.slice(0, 5).map((i) => <InsightCard key={i.id} insight={i} tone="dark" showEvent={false} />)}</ul> :

          <p className="mt-4 rounded-xl bg-white/5 p-5 text-sm text-paper/70">Nothing urgent. Deadlines, deposits and RSVPs look healthy.</p>
          }
        </section>

        <Panel title="Plan progress" to={`${base}/plan`} linkLabel="All tasks">
          <div className="flex items-center justify-between text-sm">
            <span className="text-smoke">{done} of {tasks.length} tasks done</span>
            <span className="font-semibold text-ink">{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</span>
          </div>
          <ProgressBar value={done} max={tasks.length || 1} label="Task completion" className="mt-2" />
          <ul className="mt-4 divide-y divide-line">
            {nextTasks.map((t) => {
              const overdue = t.dueDate && isPast(t.dueDate);
              return (
                <li key={t.id}>
                  <Link to={`${base}/plan?task=${t.id}`} className="flex items-center gap-3 py-2.5 hover:bg-paper">
                    <Circle className="h-4 w-4 shrink-0 text-line" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{t.title}</span>
                    {t.dueDate && <span className={cx('shrink-0 text-xs font-semibold', overdue ? 'text-danger' : 'text-smoke')}>{overdue ? 'Overdue' : dueLabel(t.dueDate)}</span>}
                  </Link>
                </li>);

            })}
            {!nextTasks.length && <li className="flex items-center gap-2 py-3 text-sm text-smoke"><CheckCircle2 className="h-4 w-4 text-forest" aria-hidden="true" /> All tasks complete.</li>}
          </ul>
        </Panel>

        {event.features.vendors &&
        <Panel title="Key bookings" to={`${base}/vendors`} linkLabel="Vendors">
            {bookings.length ?
          <ul className="space-y-2">
                {bookings.map((b) => {
              const v = db.vendors.find((x) => x.id === b.vendorId);
              const f = bookingFinance(db, b);
              return (
                <li key={b.id}>
                      <Link to={`${base}/vendors?booking=${b.id}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3 hover:border-ink">
                        <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-ink">{v?.name}</span><span className="text-xs text-smoke">{b.serviceName}</span></span>
                        <span className="text-sm tabular-nums text-ink">{formatNaira(f.paid)} / {formatNaira(b.agreedAmount)}</span>
                        <StatusPill tone={BOOKING_TONE[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</StatusPill>
                      </Link>
                    </li>);

            })}
              </ul> :
          <p className="text-sm text-smoke">No bookings yet.</p>}
          </Panel>
        }
      </div>

      <div className="space-y-5">
        <Panel title="Budget snapshot" to={`${base}/money`} linkLabel="Money">
          <p className="font-display text-2xl font-bold tabular-nums text-ink">{formatNaira(fin.budget)}</p>
          <BudgetMeter summary={fin} className="mt-3" />
          <div className="mt-3 flex justify-between rounded-xl bg-paper p-3 text-sm"><span className="text-smoke">Received (confirmed)</span><span className="font-semibold text-forest">{formatNaira(fin.received)}</span></div>
        </Panel>
        {event.features.guests &&
        <Panel title="RSVPs" to={`${base}/guests`} linkLabel="Guests">
            <div className="flex items-center gap-4">
              <RsvpRing summary={rsvp} size={110} />
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2"><dt className="text-smoke">Attending</dt><dd className="font-semibold">{rsvp.attending}</dd></div>
                <div className="flex gap-2"><dt className="text-smoke">Pending</dt><dd className="font-semibold">{rsvp.pending}</dd></div>
                <div className="flex gap-2"><dt className="text-smoke">Declined</dt><dd className="font-semibold">{rsvp.declined}</dd></div>
                {event.capacity && <div className="flex gap-2"><dt className="text-smoke">Capacity</dt><dd className="font-semibold">{event.capacity}</dd></div>}
              </dl>
            </div>
          </Panel>
        }
        {tickets &&
        <Panel title="Tickets" to={`${base}/tickets`} linkLabel="Tickets">
            <p className="font-display text-3xl font-bold text-ink">{tickets.sold}<span className="text-base font-medium text-smoke"> / {tickets.capacity} sold</span></p>
            <ProgressBar value={tickets.sold} max={tickets.capacity || 1} label="Tickets sold" className="mt-2" />
            <p className="mt-2 text-sm text-smoke">{formatNaira(tickets.revenue)} simulated sales · {tickets.checkedIn} checked in</p>
          </Panel>
        }
        <Panel title="Recent activity" to={`${base}/updates`} linkLabel="Updates">
          <ActivityFeed items={activity} />
        </Panel>
      </div>
    </div>);

}