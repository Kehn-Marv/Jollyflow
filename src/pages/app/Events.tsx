import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarSearch, Plus } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import { EventCard } from '../../components/events/EventCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { isPast } from '../../utils/dates';
import type { EventRecord } from '../../types/domain';
import { btn, cx } from '../../utils/styles';

const TABS = [
{ id: 'upcoming', label: 'Upcoming' },
{ id: 'drafts', label: 'Drafts' },
{ id: 'past', label: 'Past' },
{ id: 'closed', label: 'Archived & cancelled' }] as
const;
type TabId = (typeof TABS)[number]['id'];

function inTab(e: EventRecord, tab: TabId) {
  if (tab === 'drafts') return e.status === 'draft';
  if (tab === 'closed') return e.status === 'archived' || e.status === 'cancelled';
  if (tab === 'past') return e.status === 'published' && isPast(e.endsAt);
  return e.status === 'published' && !isPast(e.endsAt);
}

export function Events() {
  const db = useDb();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'upcoming') as TabId;
  const q = params.get('q') ?? '';

  const managed = db.events.filter((e) => e.managed);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return managed.
    filter((e) => needle ? true : inTab(e, tab)).
    filter((e) => !needle || `${e.title} ${e.city} ${e.venue}`.toLowerCase().includes(needle)).
    sort((a, b) => tab === 'past' ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt));
  }, [managed, tab, q]);

  function update(next: Record<string, string>) {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    setParams(p, { replace: true });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-ink">Events</h1>
          <p className="mt-1 text-smoke">{managed.length} events in your workspace</p>
        </div>
        <Link to="/app/events/new" className={cx(btn.base, btn.lime, btn.md, 'self-start')}><Plus className="h-4 w-4" aria-hidden="true" /> Create event</Link>
      </header>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter events">
          {TABS.map((t) =>
          <button key={t.id} type="button" role="tab" aria-selected={!q && tab === t.id} onClick={() => update({ tab: t.id, q: '' })} className={cx('whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition', !q && tab === t.id ? 'border-ink bg-ink text-paper' : 'border-line bg-white text-ink hover:border-ink')}>
              {t.label} <span className="ml-1 opacity-60">{managed.filter((e) => inTab(e, t.id)).length}</span>
            </button>
          )}
        </div>

      </div>
      {q &&
      <p className="text-sm text-smoke" role="status">
          {list.length} result{list.length === 1 ? '' : 's'} for “{q}” across all events
          <button type="button" onClick={() => update({ q: '' })} className="ml-2 font-medium text-ink underline-offset-4 hover:underline">Clear</button>
        </p>
      }
      {list.length ?
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{list.map((e) => <EventCard key={e.id} event={e} />)}</div> :

      <EmptyState icon={CalendarSearch} title={q ? 'No matching events' : 'Nothing here yet'} message={q ? 'Try a different name or city.' : 'Events will show up here as you create and manage them.'} action={<Link to="/app/events/new" className={cx(btn.base, btn.ink, btn.md)}>Create event</Link>} />
      }
    </div>);

}