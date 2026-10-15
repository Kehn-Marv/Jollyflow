import React from 'react';
import { useDb } from '../../../contexts/DataContext';
import { bookingFinance } from '../../../utils/finance';
import { dueLabel } from '../../../utils/dates';
import { formatNaira } from '../../../utils/money';
import { BOOKING_STATUS_LABELS } from '../../../utils/events';
import { BOOKING_TONE, StatusPill } from '../../ui/StatusPill';

export function VendorTimelineVisual({ eventId = 'e_wedding' }: {eventId?: string;}) {
  const db = useDb();
  const rows = db.bookings.
  filter((b) => b.eventId === eventId && b.status !== 'cancelled').
  map((b) => ({ b, v: db.vendors.find((x) => x.id === b.vendorId), f: bookingFinance(db, b), next: b.depositDueDate })).
  sort((a, z) => (a.next ?? '').localeCompare(z.next ?? '')).
  slice(0, 4);

  return (
    <div className="rounded-[1.6rem] border-2 border-paper/15 bg-[#1A1B18] p-5 text-paper">
      <p className="text-xs font-semibold uppercase tracking-wider text-paper/50">Vendor commitments</p>
      <ol className="relative mt-4 space-y-4 border-l-2 border-dashed border-paper/20 pl-5">
        {rows.map(({ b, v, f }) =>
        <li key={b.id} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-ink bg-lime" aria-hidden="true" />
            <div className="rounded-2xl bg-white p-4 text-ink">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{v?.name}</p>
                  <p className="text-xs text-smoke">{b.serviceName}</p>
                </div>
                <StatusPill tone={BOOKING_TONE[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</StatusPill>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-smoke">
                <span>{formatNaira(f.paid)} paid of {formatNaira(b.agreedAmount)}</span>
                {b.depositDueDate && f.depositOutstanding > 0 && b.status === 'confirmed' && <span className="font-semibold text-coral">Deposit {dueLabel(b.depositDueDate)}</span>}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
                <div className="h-full bg-ink" style={{ width: `${f.paid / Math.max(b.agreedAmount, 1) * 100}%` }} />
              </div>
            </div>
          </li>
        )}
      </ol>
    </div>);

}