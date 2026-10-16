import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, PieChart, Plus, Store, UserPlus } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { computeInsights } from '../../utils/insights';
import { summarisePortfolio } from '../../utils/finance';
import { daysUntil, isPast } from '../../utils/dates';
import { formatNaira, formatNairaCompact } from '../../utils/money';
import { BudgetMeter } from '../../components/money/BudgetMeter';
import { EventPickerDialog } from '../../components/events/EventPickerDialog';
import { DemoTag } from '../../components/ui/DemoTag';
import type { EventFeatures, EventRecord } from '../../types/domain';
import { btn, cx } from '../../utils/styles';

type QuickKey = 'guests' | 'task' | 'budget' | 'vendor';
const QUICK: Array<{key: QuickKey;label: string;icon: typeof UserPlus;path: string;feature?: keyof EventFeatures;}> = [
{ key: 'guests', label: 'Invite guests', icon: UserPlus, path: 'guests?new=1', feature: 'guests' },
{ key: 'task', label: 'Add task', icon: CheckSquare, path: 'plan?new=1' },
{ key: 'budget', label: 'Add budget item', icon: PieChart, path: 'money?new=item' },
{ key: 'vendor', label: 'Add vendor', icon: Store, path: 'vendors?new=1', feature: 'vendors' }];


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
  const drafts = active.filter((e) => e.status === 'draft').length;
  const next = active.find((e) => e.status === 'published');
  const days = next ? Math.max(0, daysUntil(next.startsAt)) : null;
  const insights = computeInsights(db);
  const open = db.tasks.filter((t) => active.some((e) => e.id === t.eventId) && t.status !== 'done');
  const overdue = open.filter((t) => t.dueDate && isPast(t.dueDate)).length;
  const money = summarisePortfolio(db, active.map((e) => e.id));
  const quick = QUICK.find((q) => q.key === picker);
  const pickable = active.filter((e) => !quick?.feature || e.features[quick.feature]);

  const stats = [
  { label: 'Active events', value: String(active.length), sub: drafts ? `${drafts} in draft` : 'All published', to: '/app/events' },
  { label: 'Next event', value: days === null ? '—' : days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`, sub: next?.title ?? 'Nothing scheduled', to: next ? `/app/events/${next.id}` : '/app/events' },
  { label: 'Open tasks', value: String(open.length), sub: overdue ? `${overdue} overdue` : 'None overdue', danger: overdue > 0 },
  { label: 'Owed to vendors & costs', value: formatNairaCompact(money.outstanding), sub: money.pendingOut ? `${formatNairaCompact(money.pendingOut)} pending confirmation` : 'Nothing pending' }];


  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-smoke">{new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{greeting()}, {user?.name.split(' ')[0]}.</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-smoke">
            {insights.length ? `${insights.length} thing${insights.length === 1 ? '' : 's'} need your attention today.` : 'Nothing needs your attention today.'}
            <DemoTag />
          </p>
        </div>
        <Link to="/app/events/new" className={cx(btn.base, btn.lime, btn.lg, 'self-start sm:self-auto')}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Create event
        </Link>
      </header>

      {/* Stats */}
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const body =
          <>
              <dt className="text-sm text-smoke">{s.label}</dt>
              <dd className="mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight text-ink">{s.value}</dd>
              <dd className={cx('mt-1.5 truncate text-[13px]', s.danger ? 'font-medium text-danger' : 'text-smoke')}>{s.sub}</dd>
            </>;

          return s.to ?
          <Link key={s.label} to={s.to} className="block rounded-3xl border border-line bg-white p-5 transition hover:border-ink/25">{body}</Link> :

          <div key={s.label} className="rounded-3xl border border-line bg-white p-5">{body}</div>;

        })}
      </dl>

      {/* Actions + money */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="quick-title" className="rounded-3xl border border-line bg-white p-6">
          <h2 id="quick-title" className="font-display text-lg font-semibold text-ink">Quick actions</h2>
          <p className="mt-0.5 text-sm text-smoke">Pick an event, then jump straight in.</p>
          <ul className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-1">
            {QUICK.map(({ key, label, icon: Icon }) =>
            <li key={key}>
                <button
                type="button"
                onClick={() => setPicker(key)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3 text-left text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-paper">
                
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  {label}
                </button>
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="money-title" className="rounded-3xl border border-line bg-white p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <h2 id="money-title" className="font-display text-lg font-semibold text-ink">Portfolio money</h2>
            <span className="text-sm text-smoke">{active.length} active event{active.length === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-5 grid gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-display text-4xl font-semibold tabular-nums tracking-tight text-ink">{formatNaira(money.budget)}</p>
              <p className="mt-1 text-sm text-smoke">combined budgets</p>
              <BudgetMeter className="mt-6" summary={money} />
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-paper p-5">
              <div>
                <p className="text-sm text-smoke">Received (confirmed)</p>
                <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-forest">{formatNaira(money.received)}</p>
              </div>
              <p className="text-xs leading-relaxed text-smoke">Gifts, contributions and ticket sales. Incoming money is shown separately and never added to budgets.</p>
            </div>
          </div>
        </section>
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