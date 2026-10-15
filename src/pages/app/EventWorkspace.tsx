import React from 'react';
import { Link, Navigate, NavLink, useParams } from 'react-router-dom';
import { CalendarX2 } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import type { EventFeatures } from '../../types/domain';
import { EventHeader } from '../../components/workspace/EventHeader';
import { OverviewTab } from '../../components/workspace/OverviewTab';
import { TasksTab } from '../../components/workspace/TasksTab';
import { GuestsTab } from '../../components/workspace/GuestsTab';
import { VendorsTab } from '../../components/workspace/VendorsTab';
import { MoneyTab } from '../../components/workspace/MoneyTab';
import { GiftsTab } from '../../components/workspace/GiftsTab';
import { TicketsTab } from '../../components/workspace/TicketsTab';
import { UpdatesTab } from '../../components/workspace/UpdatesTab';
import { MemoriesTab } from '../../components/workspace/MemoriesTab';
import { FeatureOffNotice } from '../../components/workspace/FeatureOffNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { btn, cx } from '../../utils/styles';

const TABS: Array<{id: string;label: string;feature?: keyof EventFeatures;}> = [
{ id: 'overview', label: 'Overview' },
{ id: 'plan', label: 'Plan & tasks' },
{ id: 'guests', label: 'Guests', feature: 'guests' },
{ id: 'vendors', label: 'Vendors', feature: 'vendors' },
{ id: 'money', label: 'Budget' },
{ id: 'gifts', label: 'Gifts', feature: 'gifting' },
{ id: 'tickets', label: 'Tickets', feature: 'tickets' },
{ id: 'updates', label: 'Updates & team' },
{ id: 'memories', label: 'Memories', feature: 'memories' }];


export function EventWorkspace() {
  const { eventId, tab = 'overview' } = useParams();
  const db = useDb();
  const event = db.events.find((e) => e.id === eventId && e.managed);

  if (!event) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Event not found"
        message="It may have been deleted, or the demo data was reset."
        action={<Link to="/app/events" className={cx(btn.base, btn.ink, btn.md)}>Back to events</Link>} />);


  }

  const current = TABS.find((t) => t.id === tab);
  if (!current) return <Navigate to={`/app/events/${event.id}`} replace />;
  const visible = TABS.filter((t) => !t.feature || event.features[t.feature] || t.id === tab);
  const featureOff = current.feature && !event.features[current.feature];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <EventHeader event={event} />
      <nav aria-label="Event sections" className="sticky top-16 z-10 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur sm:-mx-6 sm:px-6">
        <ul className="no-scrollbar flex gap-1 overflow-x-auto">
          {visible.map((t) =>
          <li key={t.id}>
              <NavLink
              to={t.id === 'overview' ? `/app/events/${event.id}` : `/app/events/${event.id}/${t.id}`}
              end
              className={() => cx('relative block whitespace-nowrap px-3 py-3.5 text-sm font-semibold transition', t.id === tab ? 'text-ink' : 'text-smoke hover:text-ink')}
              aria-current={t.id === tab ? 'page' : undefined}>
              
                {t.label}
                {t.id === tab && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-coral" aria-hidden="true" />}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div>
        {featureOff && current.feature ?
        <FeatureOffNotice event={event} feature={current.feature} label={current.label} /> :

        <>
            {tab === 'overview' && <OverviewTab event={event} />}
            {tab === 'plan' && <TasksTab event={event} />}
            {tab === 'guests' && <GuestsTab event={event} />}
            {tab === 'vendors' && <VendorsTab event={event} />}
            {tab === 'money' && <MoneyTab event={event} />}
            {tab === 'gifts' && <GiftsTab event={event} />}
            {tab === 'tickets' && <TicketsTab event={event} />}
            {tab === 'updates' && <UpdatesTab event={event} />}
            {tab === 'memories' && <MemoriesTab event={event} />}
          </>
        }
      </div>
    </div>);

}