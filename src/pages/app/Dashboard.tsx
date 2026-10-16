import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarSearch, Plus } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { isPast } from '../../utils/dates';
import type { EventRecord } from '../../types/domain';
import { btn, cx } from '../../utils/styles';

const TABS = [
{ id: 'upcoming', label: 'Upcoming' },
{ id: 'drafts', label: 'Drafts' },
{ id: 'past', label: 'Past' },
{ id: 'closed', label: 'Archived' }] as
const;
type TabId = (typeof TABS)[number]['id'];

function inTab(e: EventRecord, tab: TabId) {
  if (tab === 'drafts') return e.status === 'draft';
  if (tab === 'closed') return e.status === 'archived' || e.status === 'cancelled';
  if (tab === 'past') return e.status === 'published' && isPast(e.endsAt);
  return e.status === 'published' && !isPast(e.endsAt);
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** My Events — every event is its own workspace; nothing is summed across events here. */
export function Dashboard() {
  const db = useDb();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'upcoming') as TabId;
  const q = params.get('q') ?? '';

  const managed = useMemo(() => db.events.filter((e) => e.managed), [db.events]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return managed.
    filter((e) => needle ? `${e.title} ${e.city} ${e.venue}`.toLowerCase().includes(needle) : inTab(e, tab)).
    sort((a, b) => tab === 'past' && !needle ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt));
  }, [managed, tab, q]);

  function update(next: Record<string, string>) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    setParams(p, { replace: true });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-smoke">My Events</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{greeting()}, {user?.name.split(' ')[0]}</h1>
        </div>
        <Link to="/app/events/new" className={cx(btn.base, btn.ink, btn.md, 'self-start sm:self-auto')}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New event
        </Link>
      </header>

      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter events">
        {TABS.map((t) => {
          const selected = !q && tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => update({ tab: t.id === 'upcoming' ? '' : t.id, q: '' })}
              className={cx('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition', selected ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink/40')}>
              
              {t.label}
              <span className="tabular-nums opacity-60">{managed.filter((e) => inTab(e, t.id)).length}</span>
            </button>);

        })}
      </div>

      {q &&
      <p className="text-sm text-smoke" role="status">
          {list.length} result{list.length === 1 ? '' : 's'} for “{q}”
          <button type="button" onClick={() => update({ q: '' })} className="ml-2 font-medium text-ink underline-offset-4 hover:underline">Clear</button>
        </p>
      }

      {list.length ?
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e) => <li key={e.id}><EventCard event={e} /></li>)}
        </ul> :

      <EmptyState
        icon={CalendarSearch}
        title={q ? 'No matching events' : tab === 'upcoming' ? 'No upcoming events' : 'Nothing here yet'}
        message={q ? 'Try a different name or city.' : 'Events show up here as you create and manage them.'}
        action={<Link to="/app/events/new" className={cx(btn.base, btn.ink, btn.md)}><Plus className="h-4 w-4" aria-hidden="true" /> New event</Link>} />

      }
    </div>);

}