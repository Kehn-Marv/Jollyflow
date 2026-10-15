import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, CheckSquare, ChevronDown, PieChart, Plus, Store, UserPlus } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { computeInsights } from '../../utils/insights';
import { summarisePortfolio } from '../../utils/finance';
import { daysUntil, isPast } from '../../utils/dates';
import { formatNaira, formatNairaCompact } from '../../utils/money';
import { EventCard } from '../../components/events/EventCard';
import { InsightCard } from '../../components/insights/InsightCard';
import { ActivityFeed } from '../../components/activity/ActivityFeed';
import { BudgetMeter } from '../../components/money/BudgetMeter';
import { EventPickerDialog } from '../../components/events/EventPickerDialog';
import { DemoTag } from '../../components/ui/DemoTag';
import { EmptyState } from '../../components/ui/EmptyState';
import type { EventFeatures, EventRecord } from '../../types/domain';
import { btn, cx } from '../../utils/styles';

type QuickKey = 'guests' | 'task' | 'budget' | 'vendor';
const QUICK: Array<{key: QuickKey;label: string;icon: typeof UserPlus;path: string;feature?: keyof EventFeatures;}> = [
{ key: 'guests', label: 'Invite guests', icon: UserPlus, path: 'guests?new=1', feature: 'guests' },
{ key: 'task', label: 'Add task', icon: CheckSquare, path: 'plan?new=1' },
{ key: 'budget', label: 'Add budget item', icon: PieChart, path: 'money?new=item' },
{ key: 'vendor', label: 'Add vendor', icon: Store, path: 'vendors?new=1' }];


function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function Dashboard() {
  const db = useDb();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [picker, setPicker] = useState<QuickKey | null>(null);

  const managed = db.events.filter((e) => e.managed);
  const active = useMemo(
    () => managed.filter((e) => (e.status === 'published' || e.status === 'draft') && !isPast(e.endsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [managed]
  );
  const insights = computeInsights(db);
  const portfolio = summarisePortfolio(db, active.map((e) => e.id));
  const openTasks = db.tasks.filter((t) => active.some((e) => e.id === t.eventId) && t.status !== 'done');
  const overdue = openTasks.filter((t) => t.dueDate && isPast(t.dueDate)).length;
  const next = active.find((e) => e.status === 'published');
  const activity = db.activities.filter((a) => managed.some((e) => e.id === a.eventId)).slice(0, 8);
  const quick = QUICK.find((q) => q.key === picker);
  const pickable = active.filter((e) => !quick?.feature || e.features[quick.feature]);

  const stats = [
  { label: 'Active events', value: String(active.length), sub: `${active.filter((e) => e.status === 'draft').length} in draft` },
  { label: 'Next event', value: next ? `${daysUntil(next.startsAt)} days` : '—', sub: next?.title ?? 'Nothing scheduled' },
  { label: 'Open tasks', value: String(openTasks.length), sub: overdue ? `${overdue} overdue` : 'None overdue', alert: overdue > 0 },
  { label: 'Owed to vendors & costs', value: formatNairaCompact(portfolio.outstanding), sub: `${formatNairaCompact(portfolio.pendingOut)} pending confirmation` }];


  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-smoke">{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">{greeting()}, {user?.name.split(' ')[0]}.</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-smoke">
            {insights.length ? `${insights.length} things need your attention today.` : 'Everything is on track.'}
            <DemoTag />
          </p>
        </div>
        <Link to="/app/events/new" className={cx(btn.base, btn.lime, btn.md, 'self-start sm:self-auto')}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Create event
        </Link>
      </header>

      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) =>
        <div key={s.label} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
            <dt className="text-xs font-medium text-smoke sm:text-sm">{s.label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold tabular-nums text-ink sm:text-3xl">{s.value}</dd>
            <dd className={cx('mt-0.5 truncate text-xs', s.alert ? 'font-semibold text-danger' : 'text-smoke')}>{s.sub}</dd>
          </div>
        )}
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="on-dark rounded-[1.4rem] bg-ink p-4 text-paper sm:p-6 lg:col-span-2" aria-labelledby="attention-title">
          <div className="flex items-center justify-between gap-3 px-1">
            <div>
              <h2 id="attention-title" className="font-display text-xl font-semibold">Needs attention</h2>
              <p className="text-xs text-paper/55">Rule-based checks across your events · most urgent first</p>
            </div>
            <span className="rounded-full bg-lime px-2.5 py-0.5 text-xs font-bold text-ink">{insights.length}</span>
          </div>
          {insights.length ?
          <>
              <ul className="mt-3 space-y-1">
                {(showAll ? insights : insights.slice(0, 5)).map((i) => <InsightCard key={i.id} insight={i} tone="dark" />)}
              </ul>
              {insights.length > 5 &&
            <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-sm font-semibold text-lime hover:bg-white/5" aria-expanded={showAll}>
                  {showAll ? 'Show fewer' : `Show all ${insights.length}`}
                  <ChevronDown className={cx('h-4 w-4 transition', showAll && 'rotate-180')} aria-hidden="true" />
                </button>
            }
            </> :

          <p className="mt-6 rounded-xl bg-white/5 p-6 text-center text-sm text-paper/70">All clear — no deadlines, payments or RSVPs need attention.</p>
          }
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.4rem] border border-line bg-white p-5" aria-labelledby="quick-title">
            <h2 id="quick-title" className="font-display text-lg font-semibold text-ink">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/app/events/new" className="col-span-2 flex items-center gap-3 rounded-xl border-2 border-ink bg-lime px-3 py-3 text-sm font-semibold text-ink shadow-pop-sm transition hover:-translate-y-px">
                <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Create event
              </Link>
              {QUICK.map(({ key, label, icon: Icon }) =>
              <button key={key} type="button" onClick={() => setPicker(key)} className="flex items-center gap-2 rounded-xl border border-line px-3 py-3 text-left text-sm font-medium text-ink transition hover:border-ink hover:bg-paper">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {label}
                </button>
              )}
            </div>
          </section>
          <section className="rounded-[1.4rem] border border-line bg-white p-5" aria-labelledby="money-title">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="money-title" className="font-display text-lg font-semibold text-ink">Portfolio money</h2>
              <span className="text-xs text-smoke">{active.length} active events</span>
            </div>
            <p className="mt-2 font-display text-2xl font-bold tabular-nums text-ink">{formatNaira(portfolio.budget)}</p>
            <p className="text-xs text-smoke">combined budgets</p>
            <BudgetMeter summary={portfolio} className="mt-4" />
            <div className="mt-4 rounded-xl bg-paper p-3 text-sm">
              <div className="flex justify-between"><span className="text-smoke">Received (confirmed)</span><span className="font-semibold tabular-nums text-forest">{formatNaira(portfolio.received)}</span></div>
              <p className="mt-1 text-[11px] text-smoke">Incoming money is shown separately and never added to budgets.</p>
            </div>
          </section>
        </div>
      </div>

      <section aria-labelledby="upcoming-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="upcoming-title" className="font-display text-xl font-semibold text-ink">Upcoming events</h2>
          <Link to="/app/events" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">All events</Link>
        </div>
        {active.length ?
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {active.slice(0, 6).map((e) => <EventCard key={e.id} event={e} />)}
          </div> :

        <EmptyState className="mt-4" icon={CalendarPlus} title="No upcoming events" message="Create your first event to start planning." action={<Link to="/app/events/new" className={cx(btn.base, btn.ink, btn.md)}>Create event</Link>} />
        }
      </section>

      <section className="rounded-[1.4rem] border border-line bg-white p-5" aria-labelledby="activity-title">
        <h2 id="activity-title" className="font-display text-lg font-semibold text-ink">Recent activity</h2>
        <div className="mt-3"><ActivityFeed items={activity} showEvent /></div>
      </section>

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