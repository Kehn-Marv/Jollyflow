import React from 'react';
import { Link, Navigate, NavLink, useLocation, useParams } from 'react-router-dom';
import { CalendarX2 } from 'lucide-react';
import { useDb } from '../../contexts/DataContext';
import type { EventFeatures, EventRecord } from '../../types/domain';
import { EventHeader } from '../../components/workspace/EventHeader';
import { PlanTab } from '../../components/workspace/PlanTab';
import { DetailsTab } from '../../components/workspace/DetailsTab';
import { StoreTab } from '../../components/workspace/StoreTab';
import { GuestsTab } from '../../components/workspace/GuestsTab';
import { VendorsTab } from '../../components/workspace/VendorsTab';
import { MoneyTab } from '../../components/workspace/MoneyTab';
import { SettingsTab } from '../../components/workspace/SettingsTab';
import { PromotionTab } from '../../components/workspace/PromotionTab';
import { FeatureOffNotice } from '../../components/workspace/FeatureOffNotice';
import { EmptyState } from '../../components/ui/EmptyState';
import { btn, cx } from '../../utils/styles';

type TabId = 'plan' | 'details' | 'store' | 'guests' | 'vendors' | 'budget' | 'settings' | 'promotion';

const TABS: Array<{id: TabId;label: string;feature?: keyof EventFeatures;render: (e: EventRecord) => React.ReactNode;}> = [
{ id: 'plan', label: 'Plan', render: (e) => <PlanTab event={e} /> },
{ id: 'details', label: 'Event Details', render: (e) => <DetailsTab event={e} /> },
{ id: 'store', label: 'Party Store', render: (e) => <StoreTab event={e} /> },
{ id: 'guests', label: 'Guest List', feature: 'guests', render: (e) => <GuestsTab event={e} /> },
{ id: 'vendors', label: 'Vendors', feature: 'vendors', render: (e) => <VendorsTab event={e} /> },
{ id: 'budget', label: 'Budget', render: (e) => <MoneyTab event={e} /> },
{ id: 'settings', label: 'Settings', render: (e) => <SettingsTab event={e} /> },
{ id: 'promotion', label: 'Promotion', render: (e) => <PromotionTab event={e} /> }];


/** Older links (alerts, activity, bookmarks) keep working. */
const LEGACY: Record<string, TabId> = {
  overview: 'details',
  memories: 'details',
  money: 'budget',
  gifts: 'store',
  tickets: 'store',
  updates: 'promotion'
};

export function EventWorkspace() {
  const { eventId, tab = 'plan' } = useParams();
  const { search } = useLocation();
  const db = useDb();
  const event = db.events.find((e) => e.id === eventId && e.managed);

  if (!event) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Event not found"
        message="It may have been deleted, or the demo data was reset."
        action={<Link to="/app" className={cx(btn.base, btn.ink, btn.md)}>Back to My Events</Link>} />);


  }

  const base = `/app/events/${event.id}`;
  if (LEGACY[tab]) return <Navigate to={`${base}/${LEGACY[tab]}${search}`} replace />;
  const current = TABS.find((t) => t.id === tab);
  if (!current) return <Navigate to={base} replace />;
  const featureOff = current.feature && !event.features[current.feature];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <EventHeader event={event} />
      <nav aria-label="Event sections" className="sticky top-14 z-10 -mx-4 border-b border-line bg-paper/95 px-4 backdrop-blur sm:top-16 sm:-mx-6 sm:px-6">
        <ul className="no-scrollbar flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === current.id;
            return (
              <li key={t.id} className="shrink-0">
                <NavLink
                  to={t.id === 'plan' ? base : `${base}/${t.id}`}
                  end
                  aria-current={active ? 'page' : undefined}
                  className={cx('relative block whitespace-nowrap px-3 py-3.5 text-sm font-medium transition', active ? 'text-ink' : 'text-smoke hover:text-ink')}>
                  
                  {t.label}
                  {active && <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-ink" aria-hidden="true" />}
                </NavLink>
              </li>);

          })}
        </ul>
      </nav>
      <div key={current.id}>
        {featureOff && current.feature ? <FeatureOffNotice event={event} feature={current.feature} label={current.label} /> : current.render(event)}
      </div>
    </div>);

}