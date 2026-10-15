import React from 'react';
import { Globe, Lock } from 'lucide-react';
import type { StepProps } from '../../types/wizard';
import { FormField, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { ToggleRow } from '../ui/ToggleRow';
import { cx, inputClass } from '../../utils/styles';

export function StepGuests({ draft, update, errors }: StepProps) {
  const options = [
  { id: 'private' as const, icon: Lock, title: 'Private', body: 'Only people with an invitation link can see it.' },
  { id: 'public' as const, icon: Globe, title: 'Public', body: 'Listed on Explore. Anyone can view and RSVP.' }];

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">Guests & access</h2>
      <p className="mt-1 text-smoke">Who can find this event, and how they respond.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Visibility">
        {options.map(({ id, icon: Icon, title, body }) => {
          const on = draft.visibility === id;
          return (
            <button key={id} type="button" role="radio" aria-checked={on} onClick={() => update({ visibility: id })} className={cx('flex gap-3 rounded-2xl border-2 p-4 text-left transition', on ? 'border-ink bg-white shadow-pop' : 'border-line bg-white/70 hover:border-ink')}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span><span className="block font-semibold text-ink">{title}</span><span className="text-sm text-smoke">{body}</span></span>
            </button>);

        })}
      </div>
      <div className="mt-6 space-y-3">
        <ToggleRow label="Collect RSVPs" description="Guests confirm attendance from the event page." checked={draft.rsvpEnabled} onChange={(v) => update({ rsvpEnabled: v, features: { ...draft.features, guests: v || draft.features.guests } })} />
        <ToggleRow label="Allow plus-ones" description="Guests can bring up to three people." checked={draft.plusOnesAllowed} onChange={(v) => update({ plusOnesAllowed: v })} />
      </div>
      <FormField label="Guest capacity" htmlFor="capacity" optional error={errors.capacity} hint="RSVPs stop once the headcount reaches this number." className="mt-6 max-w-xs">
        <Input {...fieldA11y('capacity', errors.capacity, 'x')} inputMode="numeric" value={draft.capacity} onChange={(e) => update({ capacity: e.target.value.replace(/[^\d]/g, '') })} placeholder="e.g. 150" className={inputClass} />
      </FormField>
    </div>);

}