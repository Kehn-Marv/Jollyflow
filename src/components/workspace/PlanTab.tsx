import React from 'react';
import type { EventRecord } from '../../types/domain';
import { EventWallet } from '../wallet/EventWallet';
import { TaskTracker } from './TaskTracker';
import { PlannersCard } from './PlannersCard';

export function PlanTab({ event }: {event: EventRecord;}) {
  return (
    <div className="space-y-4">
      <EventWallet event={event} />
      <div className="grid items-start gap-4 lg:grid-cols-[1.25fr_1fr]">
        <TaskTracker event={event} />
        <PlannersCard event={event} />
      </div>
    </div>);

}