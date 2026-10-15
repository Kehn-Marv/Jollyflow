import React, { useEffect, useState } from 'react';
import type { EventFeatures, EventRecord, Visibility } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ToggleRow } from '../ui/ToggleRow';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { CITIES } from '../../utils/events';
import { combineDateTime, toDateInput, toTimeInput } from '../../utils/dates';
import { koboToInput, parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const FEATURE_LABELS: Record<keyof EventFeatures, string> = { guests: 'Guests & RSVPs', vendors: 'Vendors', tickets: 'Tickets', gifting: 'Gifts', memories: 'Memories' };

export function EditEventDialog({ event, open, onOpenChange }: Props) {
  const { pending, run } = useAsyncAction();
  const init = () => ({
    title: event.title, description: event.description, date: toDateInput(event.startsAt), start: toTimeInput(event.startsAt), end: toTimeInput(event.endsAt),
    venue: event.venue, city: event.city, address: event.address, visibility: event.visibility, capacity: event.capacity ? String(event.capacity) : '',
    rsvpEnabled: event.rsvpEnabled, plusOnesAllowed: event.plusOnesAllowed, budget: koboToInput(event.budgetTotal), features: { ...event.features }
  });
  const [f, setF] = useState(init);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setF(init());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof ReturnType<typeof init>,>(k: K, v: ReturnType<typeof init>[K]) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    const e: Record<string, string> = {};
    if (f.title.trim().length < 3) e.title = 'At least 3 characters.';
    if (!f.date) e.date = 'Choose a date.';
    if (!f.venue.trim()) e.venue = 'Add a venue.';
    const budget = parseNairaInput(f.budget || '0');
    if (budget === null) e.budget = 'Enter a valid amount.';
    if (f.capacity && (!Number.isInteger(Number(f.capacity)) || Number(f.capacity) < 1)) e.capacity = 'Whole number above 0.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const startsAt = combineDateTime(f.date, f.start);
    let endsAt = combineDateTime(f.date, f.end);
    if (f.end <= f.start) endsAt = new Date(new Date(endsAt).getTime() + 86_400_000).toISOString();
    const ok = await run(
      () => service.updateEvent(event.id, {
        title: f.title.trim(), description: f.description.trim(), startsAt, endsAt, venue: f.venue.trim(), city: f.city, address: f.address.trim(),
        visibility: f.visibility, capacity: f.capacity ? Number(f.capacity) : null, rsvpEnabled: f.rsvpEnabled, plusOnesAllowed: f.plusOnesAllowed,
        budgetTotal: budget ?? 0, features: f.features
      }),
      { success: 'Event updated' }
    );
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Edit event details" submitLabel="Save changes" pending={pending} onSubmit={save} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Event name" htmlFor="ev-title" error={errors.title} className="sm:col-span-2">
          <Input {...fieldA11y('ev-title', errors.title)} value={f.title} onChange={(e) => set('title', e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Description" htmlFor="ev-desc" optional className="sm:col-span-2">
          <Textarea id="ev-desc" rows={3} value={f.description} onChange={(e) => set('description', e.target.value)} className="rounded-xl bg-white" />
        </FormField>
        <FormField label="Date" htmlFor="ev-date" error={errors.date}>
          <Input {...fieldA11y('ev-date', errors.date)} type="date" value={f.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Starts" htmlFor="ev-start"><Input id="ev-start" type="time" value={f.start} onChange={(e) => set('start', e.target.value)} className={inputClass} /></FormField>
          <FormField label="Ends" htmlFor="ev-end"><Input id="ev-end" type="time" value={f.end} onChange={(e) => set('end', e.target.value)} className={inputClass} /></FormField>
        </div>
        <FormField label="Venue" htmlFor="ev-venue" error={errors.venue}>
          <Input {...fieldA11y('ev-venue', errors.venue)} value={f.venue} onChange={(e) => set('venue', e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="City" htmlFor="ev-city">
          <NativeSelect id="ev-city" value={f.city} onChange={(e) => set('city', e.target.value)}>
            {Array.from(new Set([f.city, ...CITIES])).map((c) => <option key={c}>{c}</option>)}
          </NativeSelect>
        </FormField>
        <FormField label="Address" htmlFor="ev-addr" optional className="sm:col-span-2">
          <Input id="ev-addr" value={f.address} onChange={(e) => set('address', e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Visibility" htmlFor="ev-vis">
          <NativeSelect id="ev-vis" value={f.visibility} onChange={(e) => set('visibility', e.target.value as Visibility)}>
            <option value="private">Private — invitation link only</option>
            <option value="public">Public — listed on Explore</option>
          </NativeSelect>
        </FormField>
        <FormField label="Capacity" htmlFor="ev-cap" optional error={errors.capacity}>
          <Input {...fieldA11y('ev-cap', errors.capacity)} inputMode="numeric" value={f.capacity} onChange={(e) => set('capacity', e.target.value.replace(/[^\d]/g, ''))} className={inputClass} />
        </FormField>
        <FormField label="Total budget" htmlFor="ev-budget" error={errors.budget} className="sm:col-span-2">
          <MoneyInput {...fieldA11y('ev-budget', errors.budget)} value={f.budget} onChange={(e) => set('budget', e.target.value)} />
        </FormField>
      </div>
      <div className="space-y-2">
        <ToggleRow label="Collect RSVPs" checked={f.rsvpEnabled} onChange={(v) => set('rsvpEnabled', v)} />
        <ToggleRow label="Allow plus-ones" checked={f.plusOnesAllowed} onChange={(v) => set('plusOnesAllowed', v)} />
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-ink">Features</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(FEATURE_LABELS) as Array<keyof EventFeatures>).map((k) =>
          <ToggleRow key={k} label={FEATURE_LABELS[k]} checked={f.features[k]} onChange={(v) => set('features', { ...f.features, [k]: v })} />
          )}
        </div>
      </fieldset>
    </FormDialog>);

}