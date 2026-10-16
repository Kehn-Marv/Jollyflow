import React from 'react';
import type { EventRecord } from '../../types/domain';
import { OverviewTab } from './OverviewTab';
import { MemoriesTab } from './MemoriesTab';

/** Event details: the at-a-glance overview, plus shared memories when that feature is on. */
export function DetailsTab({ event }: {event: EventRecord;}) {
  return (
    <div className="space-y-10">
      <OverviewTab event={event} />
      {event.features.memories &&
      <section aria-labelledby="memories-title" className="space-y-4">
          <h2 id="memories-title" className="font-display text-lg font-semibold text-ink">Memories</h2>
          <MemoriesTab event={event} />
        </section>
      }
    </div>);

}