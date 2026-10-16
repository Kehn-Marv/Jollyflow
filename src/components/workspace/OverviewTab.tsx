import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import type { InsightKind } from '../../types/insights';
import { useDb } from '../../contexts/DataContext';
import { computeInsights } from '../../utils/insights';
import { rsvpSummary } from '../../utils/rsvp';
import { eventTicketStats } from '../../utils/tickets';
import { dueLabel, isPast } from '../../utils/dates';
import { BOOKING_STATUS_LABELS } from '../../utils/events';
import { InsightCard } from '../insights/InsightCard';
import { RSVP_COLORS, RsvpRing } from '../guests/RsvpRing';
import { ActivityFeed } from '../activity/ActivityFeed';
import { ProgressBar } from '../ui/ProgressBar';
import { BOOKING_TONE, StatusPill } from '../ui/StatusPill';
import { cx } from '../../utils/styles';

const HOSTING_INSIGHTS: InsightKind[] = ['overdue_task', 'event_tasks', 'booking_unconfirmed', 'rsvp_low'];

function Panel({ title, to, linkLabel, children, className }: {title: string;to?: string;linkLabel?: string;children: React.ReactNode;className?: string;}) {
  return (
    <section className={cx('rounded-3xl border border-line bg-white p-6 sm:p-7', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
        {to && <Link to={to} className="inline-flex items-center gap-1 text-sm text-smoke hover:text-ink">{linkLabel ?? 'Open'} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
      </div>
      <div className="mt-5">{children}</div>
    </section>);

}

export function OverviewTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const base = `/app/events/${event.id}`;
  const insights = computeInsights(db, new Date(), event.id).filter((i) => HOSTING_INSIGHTS.includes(i.kind));
  const tasks = db.tasks.filter((t) => t.eventId === event.id);
  const done = tasks.filter((t) => t.status === 'done').length;
  const nextTasks = tasks.filter((t) => t.status !== 'done').sort((a, b) => (a.dueDate ?? '9').localeCompare(b.dueDate ?? '9')).slice(0, 4);
  const rsvp = rsvpSummary(db.guests.filter((g) => g.eventId === event.id));
  const tickets = event.features.tickets ? eventTicketStats(db, event.id) : null;
  const bookings = db.bookings.filter((b) => b.eventId === event.id && b.status !== 'cancelled' && b.status !== 'declined').slice(0, 4);
  const activity = db.activities.filter((a) => a.eventId === event.id && a.kind !== 'payment').slice(0, 6);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Panel title="Next steps">
          {insights.length ?
          <ul className="space-y-1.5">{insights.slice(0, 4).map((i) => <InsightCard key={i.id} insight={i} showEvent={false} />)}</ul> :

          <p className="text-sm text-smoke">Nothing pressing. Tasks, bookings and RSVPs look healthy.</p>
          }
        </Panel>

        <Panel title="Plan progress" to={`${base}/plan`} linkLabel="All tasks">
          <div className="flex items-center justify-between text-sm">
            <span className="text-smoke">{done} of {tasks.length} tasks done</span>
            <span className="font-medium text-ink">{tasks.length ? Math.round(done / tasks.length * 100) : 0}%</span>
          </div>
          <ProgressBar value={done} max={tasks.length || 1} label="Task completion" size="sm" className="mt-3" />
          <ul className="mt-4 space-y-0.5">
            {nextTasks.map((t) => {
              const overdue = t.dueDate && isPast(t.dueDate);
              return (
                <li key={t.id}>
                  <Link to={`${base}/plan?task=${t.id}`} className="-mx-3 flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-paper">
                    <Circle className="h-4 w-4 shrink-0 text-line" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{t.title}</span>
                    {t.dueDate && <span className={cx('shrink-0 text-xs', overdue ? 'font-medium text-danger' : 'text-smoke')}>{overdue ? 'Overdue' : dueLabel(t.dueDate)}</span>}
                  </Link>
                </li>);

            })}
            {!nextTasks.length && <li className="flex items-center gap-2 py-3 text-sm text-smoke"><CheckCircle2 className="h-4 w-4 text-forest" aria-hidden="true" /> All tasks complete.</li>}
          </ul>
        </Panel>

        {event.features.vendors &&
        <Panel title="Vendors" to={`${base}/vendors`} linkLabel="All vendors">
            {bookings.length ?
          <ul className="space-y-0.5">
                {bookings.map((b) => {
              const v = db.vendors.find((x) => x.id === b.vendorId);
              return (
                <li key={b.id}>
                      <Link to={`${base}/vendors?booking=${b.id}`} className="-mx-3 flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-paper">
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink">{v?.name}</span><span className="text-xs text-smoke">{b.serviceName}</span></span>
                        <StatusPill tone={BOOKING_TONE[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</StatusPill>
                      </Link>
                    </li>);

            })}
              </ul> :
          <p className="text-sm text-smoke">No vendors booked yet.</p>}
          </Panel>
        }
      </div>

      <div className="space-y-6">
        {event.features.guests &&
        <Panel title="Guests" to={`${base}/guests`} linkLabel="Guest list">
            <div className="flex items-center gap-6">
              <RsvpRing summary={rsvp} size={112} />
              <dl className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2.5 text-sm">
                {[
              { label: 'Attending', value: rsvp.attending, color: RSVP_COLORS.attending },
              { label: 'Pending', value: rsvp.pending, color: RSVP_COLORS.pending },
              { label: 'Declined', value: rsvp.declined, color: RSVP_COLORS.declined }].
              map((row) =>
              <React.Fragment key={row.label}>
                    <dt className="flex items-center gap-2 text-smoke">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.color }} aria-hidden="true" />
                      {row.label}
                    </dt>
                    <dd className="text-right font-medium tabular-nums text-ink">{row.value}</dd>
                  </React.Fragment>
              )}
                {event.capacity &&
              <>
                    <dt className="flex items-center gap-2 border-t border-line pt-2.5 text-smoke">
                      <span className="h-2 w-2 shrink-0" aria-hidden="true" />
                      Capacity
                    </dt>
                    <dd className="border-t border-line pt-2.5 text-right font-medium tabular-nums text-ink">{event.capacity}</dd>
                  </>
              }
              </dl>
            </div>
          </Panel>
        }
        {tickets &&
        <Panel title="Tickets" to={`${base}/tickets`} linkLabel="Tickets">
            <p className="font-display text-3xl font-semibold text-ink">{tickets.sold}<span className="text-base font-normal text-smoke"> / {tickets.capacity} issued</span></p>
            <ProgressBar value={tickets.sold} max={tickets.capacity || 1} label="Tickets issued" size="sm" className="mt-3" />
            <p className="mt-3 text-sm text-smoke">{tickets.checkedIn} checked in</p>
          </Panel>
        }
        <Panel title="Lately" to={`${base}/updates`} linkLabel="Updates">
          <ActivityFeed items={activity} />
        </Panel>
      </div>
    </div>);

}