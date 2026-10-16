import React from 'react';
import type { EventRecord } from '../../types/domain';
import { GiftsTab } from './GiftsTab';
import { TicketsTab } from './TicketsTab';
import { FeatureOffNotice } from './FeatureOffNotice';

/** Party Store: everything guests can buy or reserve — tickets and gifts. */
export function StoreTab({ event }: {event: EventRecord;}) {
  const { tickets, gifting } = event.features;
  if (!tickets && !gifting) return <FeatureOffNotice event={event} feature="gifting" label="Party Store" />;

  return (
    <div className="space-y-10">
      {tickets &&
      <section aria-labelledby="store-tickets" className="space-y-4">
          <h2 id="store-tickets" className="font-display text-lg font-semibold text-ink">Tickets</h2>
          <TicketsTab event={event} />
        </section>
      }
      {gifting &&
      <section aria-labelledby="store-gifts" className="space-y-4">
          <h2 id="store-gifts" className="font-display text-lg font-semibold text-ink">Gifts</h2>
          <GiftsTab event={event} />
        </section>
      }
    </div>);

}