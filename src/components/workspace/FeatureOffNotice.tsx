import React from 'react';
import { Power } from 'lucide-react';
import type { EventFeatures, EventRecord } from '../../types/domain';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { btn, cx } from '../../utils/styles';

export function FeatureOffNotice({ event, feature, label }: {event: EventRecord;feature: keyof EventFeatures;label: string;}) {
  const { pending, run } = useAsyncAction();
  return (
    <EmptyState
      icon={Power}
      title={`${label} is turned off for this event`}
      message="Turn it on to start using it. You can switch it off again from Edit details."
      action={
      <Button
        type="button"
        disabled={pending}
        onClick={() => run(() => service.updateEvent(event.id, { features: { ...event.features, [feature]: true } }), { success: `${label} turned on` })}
        className={cx(btn.base, btn.ink, btn.md)}>
        
          Turn on {label.toLowerCase()}
        </Button>
      } />);


}