import React from 'react';
import { Banknote, Check, Gift, Image as ImageIcon, Minus, Store, Ticket, Users } from 'lucide-react';
import type { EventFeatures } from '../../types/domain';
import { cx } from '../../utils/styles';

const MODULES: Array<{key: keyof EventFeatures | 'money';label: string;icon: typeof Users;}> = [
{ key: 'guests', label: 'Guests & RSVPs', icon: Users },
{ key: 'vendors', label: 'Vendors & bookings', icon: Store },
{ key: 'money', label: 'Budget & money', icon: Banknote },
{ key: 'tickets', label: 'Tickets & check-in', icon: Ticket },
{ key: 'gifting', label: 'Gifts & contributions', icon: Gift },
{ key: 'memories', label: 'Memories', icon: ImageIcon }];


interface ModuleChecklistProps {
  features: EventFeatures;
  title: string;
  note: string;
}

/** Shows which modules a given event type typically turns on. */
export function ModuleChecklist({ features, title, note }: ModuleChecklistProps) {
  return (
    <div className="rounded-[1.6rem] border-2 border-ink bg-white p-6 shadow-pop">
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-smoke">{note}</p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {MODULES.map(({ key, label, icon: Icon }) => {
          const on = key === 'money' ? true : features[key];
          return (
            <li key={key} className={cx('flex items-center gap-3 rounded-xl border px-3 py-2.5', on ? 'border-ink bg-lime/40' : 'border-line bg-paper text-smoke')}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium">{label}</span>
              {on ? <Check className="h-4 w-4" aria-label="On by default" /> : <Minus className="h-4 w-4" aria-label="Off by default" />}
            </li>);

        })}
      </ul>
    </div>);

}