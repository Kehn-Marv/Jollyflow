import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarPlus, CheckSquare, Plus, Store, UserPlus } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { computeInsights } from '../../utils/insights';
import { daysUntil, isPast } from '../../utils/dates';
import { EventCard } from '../../components/events/EventCard';
import { InsightCard } from '../../components/insights/InsightCard';
import { ActivityFeed } from '../../components/activity/ActivityFeed';
import { EventPickerDialog } from '../../components/events/EventPickerDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import type { EventFeatures, EventRecord } from '../../types/domain';
import type { InsightKind } from '../../types/insights';
import { btn, cx } from '../../utils/styles';

type QuickKey = 'guests' | 'task' | 'vendor';
const QUICK: Array<{key: QuickKey;label: string;icon: typeof UserPlus;path: string;feature?: keyof EventFeatures;}> = [
{ key: 'guests', label: 'Invite guests', icon: UserPlus, path: 'guests?new=1', feature: 'guests' },
{ key: 'task', label: 'Add a task', icon: CheckSquare, path: 'plan?new=1' },
{ key: 'vendor', label: 'Add a vendor', icon: Store, path: 'vendors?new=1' }];


/** Hosting-focused checks only — money lives in Settings › Account. */
const HOSTING_INSIGHTS: InsightKind[] = ['overdue_task', 'event_tasks', 'booking_unconfirmed', 'rsvp_low'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard() {
  const db = useDb();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [picker, setPicker] = useState<QuickKey | null>(null);

  const managed = db.events.filter((e) => e.managed);
  const active = useMemo(
    () => managed.filter((e) => (e.status === 'published' || e.status === 'draft') && !isPast(e.endsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [managed]
  );
  const insights = computeInsights(db).filter((i) => HOSTING_INSIGHTS.includes(i.kind));
  const openTasks = db.tasks.filter((t) => active.some((e) => e.id === t.eventId) && t.status !== 'done');
  const next = active.find((e) => e.status === 'published');
  const activity = db.activities.filter((a) => managed.some((e) => e.id === a.eventId) && a.kind !== 'payment').slice(0, 6);
  const quick = QUICK.find((q) => q.key === picker);
  const pickable = active.filter((e) => !quick?.feature || e.features[quick.feature]);
  const days = next ? daysUntil(next.startsAt) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-14 pb-10">
      <header className="flex flex-col justify-between gap-6 pt-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-smoke">{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{greeting()}, {user?.name.split(' ')[0]}</h1>
          <p className="mt-2 max-w-md text-smoke">
            {next ?
            <>
                <span className="text-ink">{next.title}</span> is {days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}. {openTasks.length ? `${openTasks.length} tasks still open across your events.` : 'Your to-do list is clear.'}
              </> :
            'Nothing on the calendar yet — start something worth celebrating.'}
          </p>
        </div>
        <Link to="/app/events/new" className={cx(btn.base, btn.ink, btn.md, 'self-start sm:self-auto')}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New event
        </Link>
      </header>

      <section aria-labelledby="events-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="events-title" className="font-display text-lg font-semibold text-ink">Your events <span className="ml-1 font-sans text-sm font-normal text-smoke">{active.length}</span></h2>
          <Link to="/app/events" className="inline-flex items-center gap-1 text-sm text-smoke hover:text-ink">View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </div>
        {active.length ?
        <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {active.slice(0, 6).map((e) => <EventCard key={e.id} event={e} />)}
          </div> :

        <EmptyState className="mt-5" icon={CalendarPlus} title="No upcoming events" message="Each event gets its own calm workspace for guests, tasks and vendors." action={<Link to="/app/events/new" className={cx(btn.base, btn.ink, btn.md)}>Create your first event</Link>} />
        }
      </section>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="attention-title">
          <h2 id="attention-title" className="font-display text-lg font-semibold text-ink">Worth a look</h2>
          <p className="mt-1 text-sm text-smoke">Gentle nudges from simple rules — nothing here is urgent unless it says so.</p>
          {insights.length ?
          <ul className="mt-5 divide-y divide-line rounded-3xl border border-line bg-white p-2">
              {insights.slice(0, 4).map((i) => <InsightCard key={i.id} insight={i} />)}
            </ul> :

          <p className="mt-5 rounded-3xl border border-line bg-white p-8 text-center text-sm text-smoke">All calm. Nothing needs you right now.</p>
          }
        </section>

        <div className="space-y-10">
          <section aria-labelledby="quick-title">
            <h2 id="quick-title" className="font-display text-lg font-semibold text-ink">Jump back in</h2>
            <ul className="mt-5 space-y-2">
              {QUICK.map(({ key, label, icon: Icon }) =>
              <li key={key}>
                  <button type="button" onClick={() => setPicker(key)} className="group flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3.5 text-left text-sm text-ink transition hover:border-ink/40">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-sand"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <span className="flex-1 font-medium">{label}</span>
                    <ArrowRight className="h-4 w-4 text-smoke transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
                  </button>
                </li>
              )}
            </ul>
          </section>
          <section aria-labelledby="activity-title">
            <h2 id="activity-title" className="font-display text-lg font-semibold text-ink">Lately</h2>
            <div className="mt-4"><ActivityFeed items={activity} showEvent /></div>
          </section>
        </div>
      </div>

      <EventPickerDialog
        open={picker !== null}
        onOpenChange={(o) => !o && setPicker(null)}
        title={quick?.label ?? ''}
        events={pickable}
        onPick={(e: EventRecord) => {
          setPicker(null);
          if (quick) navigate(`/app/events/${e.id}/${quick.path}`);
        }} />
      
    </div>);

}