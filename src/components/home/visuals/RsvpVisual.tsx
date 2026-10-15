import React from 'react';
import { useDb } from '../../../contexts/DataContext';
import { rsvpSummary } from '../../../utils/rsvp';
import { RsvpRing } from '../../guests/RsvpRing';
import { RSVP_LABEL, RSVP_TONE, StatusPill } from '../../ui/StatusPill';

export function RsvpVisual({ eventId = 'e_wedding' }: {eventId?: string;}) {
  const db = useDb();
  const guests = db.guests.filter((g) => g.eventId === eventId);
  const s = rsvpSummary(guests);
  const sample = [...guests].sort((a, b) => (b.respondedAt ?? '').localeCompare(a.respondedAt ?? '')).slice(0, 4);

  return (
    <div className="rounded-[1.6rem] border-2 border-ink bg-white p-5 shadow-pop-lg">
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <RsvpRing summary={s} />
        <dl className="grid w-full grid-cols-3 gap-2 sm:grid-cols-1">
          {[
          ['Attending', s.attending, 'bg-forest'],
          ['Pending', s.pending, 'bg-coral'],
          ['Declined', s.declined, 'bg-[#CFCBBE]']].
          map(([label, value, dot]) =>
          <div key={label as string} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden="true" />
              <dt className="text-sm text-smoke">{label}</dt>
              <dd className="ml-auto font-display text-lg font-bold text-ink">{value}</dd>
            </div>
          )}
        </dl>
      </div>
      <ul className="mt-5 space-y-2">
        {sample.map((g) =>
        <li key={g.id} className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink">{g.name}{g.plusOnes ? ` +${g.plusOnes}` : ''}</span>
              <span className="block text-xs text-smoke">{g.group}</span>
            </span>
            <StatusPill tone={RSVP_TONE[g.rsvp]}>{RSVP_LABEL[g.rsvp]}</StatusPill>
          </li>
        )}
      </ul>
    </div>);

}