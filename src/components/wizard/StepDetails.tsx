import React from 'react';
import { Check } from 'lucide-react';
import type { StepProps } from '../../types/wizard';
import { FormField, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { coverOptions } from '../../data/images';
import { CITIES } from '../../utils/events';
import { cx, inputClass } from '../../utils/styles';

export function StepDetails({ draft, update, errors }: StepProps) {
  const overnight = draft.startTime && draft.endTime && draft.endTime <= draft.startTime;
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">The essentials</h2>
      <p className="mt-1 text-smoke">Name, date and place. Guests will see these on the event page.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField label="Event name" htmlFor="title" error={errors.title} className="sm:col-span-2">
          <Input {...fieldA11y('title', errors.title)} value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Tolu’s 40th: Owambe Edition" className={inputClass} maxLength={80} />
        </FormField>
        <FormField label="Description" htmlFor="description" optional className="sm:col-span-2">
          <Textarea id="description" value={draft.description} onChange={(e) => update({ description: e.target.value })} rows={3} placeholder="Dress code, colours of the day, what to expect…" className="rounded-xl bg-white" maxLength={500} />
        </FormField>
        <FormField label="Date" htmlFor="date" error={errors.date}>
          <Input {...fieldA11y('date', errors.date)} type="date" value={draft.date} onChange={(e) => update({ date: e.target.value })} className={inputClass} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Starts" htmlFor="startTime" error={errors.startTime}>
            <Input {...fieldA11y('startTime', errors.startTime)} type="time" value={draft.startTime} onChange={(e) => update({ startTime: e.target.value })} className={inputClass} />
          </FormField>
          <FormField label="Ends" htmlFor="endTime" error={errors.endTime} hint={overnight ? 'Ends the next day' : undefined}>
            <Input {...fieldA11y('endTime', errors.endTime, overnight ? 'x' : undefined)} type="time" value={draft.endTime} onChange={(e) => update({ endTime: e.target.value })} className={inputClass} />
          </FormField>
        </div>
        <p className="-mt-2 text-xs text-smoke sm:col-span-2">Time zone: West Africa Time (Africa/Lagos)</p>
        <FormField label="Venue" htmlFor="venue" error={errors.venue}>
          <Input {...fieldA11y('venue', errors.venue)} value={draft.venue} onChange={(e) => update({ venue: e.target.value })} placeholder="e.g. Lagoon View Hall" className={inputClass} />
        </FormField>
        <FormField label="City" htmlFor="city" error={errors.city}>
          <NativeSelect id="city" value={draft.city} onChange={(e) => update({ city: e.target.value })}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </NativeSelect>
        </FormField>
        <FormField label="Address" htmlFor="address" optional className="sm:col-span-2">
          <Input id="address" value={draft.address} onChange={(e) => update({ address: e.target.value })} placeholder="Street and area" className={inputClass} />
        </FormField>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">Cover image</legend>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {coverOptions.map((c) => {
            const on = draft.coverUrl === c.url;
            return (
              <label key={c.url} className={cx('relative cursor-pointer overflow-hidden rounded-xl border-2 transition focus-within:ring-2 focus-within:ring-ink', on ? 'border-ink' : 'border-transparent')}>
                <input type="radio" name="cover" value={c.url} checked={on} onChange={() => update({ coverUrl: c.url })} className="sr-only" />
                <img src={c.url} alt={c.label} loading="lazy" decoding="async" className="aspect-square w-full bg-sand object-cover" />
                {on && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-lime"><Check className="h-3 w-3" aria-hidden="true" /></span>}
              </label>);

          })}
        </div>
        <p className="mt-2 text-xs text-smoke">Custom uploads will be available once media storage is connected.</p>
      </fieldset>
    </div>);

}