import React from 'react';
import { Gift, Image as ImageIcon, Store, Ticket, Users } from 'lucide-react';
import type { EventFeatures } from '../../types/domain';
import type { StepProps } from '../../types/wizard';
import { ToggleRow } from '../ui/ToggleRow';
import { FormField, MoneyInput, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { inputClass } from '../../utils/styles';

const FEATURES: Array<{key: keyof EventFeatures;label: string;body: string;icon: typeof Users;}> = [
{ key: 'guests', label: 'Guest list & RSVPs', body: 'Invitations, responses, plus-ones and headcount.', icon: Users },
{ key: 'vendors', label: 'Vendors & bookings', body: 'Track vendors, deposits and balances.', icon: Store },
{ key: 'tickets', label: 'Tickets & check-in', body: 'Sell ticket tiers (simulated) and scan guests in.', icon: Ticket },
{ key: 'gifting', label: 'Gifts & contributions', body: 'Wishlist items and cash funds.', icon: Gift },
{ key: 'memories', label: 'Memories', body: 'A photo gallery after the event.', icon: ImageIcon }];


export function StepFeatures({ draft, update, errors }: StepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">Turn on what you need</h2>
      <p className="mt-1 text-smoke">We’ve suggested a setup for this occasion. Budget & money is always on.</p>
      <div className="mt-6 space-y-3">
        {FEATURES.map(({ key, label, body, icon: Icon }) =>
        <ToggleRow key={key} label={label} description={body} icon={<Icon className="h-4 w-4" aria-hidden="true" />} checked={draft.features[key]} onChange={(v) => update({ features: { ...draft.features, [key]: v } })} />
        )}
      </div>
      {draft.features.tickets &&
      <fieldset className="mt-6 rounded-2xl border-2 border-ink bg-white p-4">
          <legend className="px-2 text-sm font-semibold text-ink">First ticket tier</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Tier name" htmlFor="tierName" error={errors.tierName}>
              <Input {...fieldA11y('tierName', errors.tierName)} value={draft.tier.name} onChange={(e) => update({ tier: { ...draft.tier, name: e.target.value } })} className={inputClass} />
            </FormField>
            <FormField label="Price" htmlFor="tierPrice" error={errors.tierPrice}>
              <MoneyInput {...fieldA11y('tierPrice', errors.tierPrice)} value={draft.tier.price} onChange={(e) => update({ tier: { ...draft.tier, price: e.target.value } })} placeholder="15000" />
            </FormField>
            <FormField label="Quantity" htmlFor="tierQuantity" error={errors.tierQuantity}>
              <Input {...fieldA11y('tierQuantity', errors.tierQuantity)} inputMode="numeric" value={draft.tier.quantity} onChange={(e) => update({ tier: { ...draft.tier, quantity: e.target.value.replace(/[^\d]/g, '') } })} placeholder="200" className={inputClass} />
            </FormField>
          </div>
          <p className="mt-3 text-xs text-smoke">You can add more tiers from the event’s Tickets tab.</p>
        </fieldset>
      }
    </div>);

}