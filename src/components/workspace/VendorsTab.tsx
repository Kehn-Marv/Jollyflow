import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, Plus, Search, Store } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { bookingFinance } from '../../utils/finance';
import { dueLabel } from '../../utils/dates';
import { formatNaira } from '../../utils/money';
import { BOOKING_STATUS_LABELS, VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { BookingDialog } from './BookingDialog';
import { AddVendorDialog } from './AddVendorDialog';
import { BookingDetailSheet } from './BookingDetailSheet';
import { PaymentDialog, type PaymentPreset } from './PaymentDialog';
import { BOOKING_TONE, StatusPill } from '../ui/StatusPill';
import { EmptyState } from '../ui/EmptyState';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

export function VendorsTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const [params, setParams] = useSearchParams();
  const bookingId = params.get('booking');
  const [addOpen, setAddOpen] = useState(params.get('new') === '1');
  const [bookOpen, setBookOpen] = useState(false);
  const [bookVendor, setBookVendor] = useState<string | null>(null);
  const [payPreset, setPayPreset] = useState<PaymentPreset | null>(null);

  const bookings = db.bookings.filter((b) => b.eventId === event.id).sort((a, b) => {
    const order = { confirmed: 0, requested: 1, declined: 2, cancelled: 3 };
    return order[a.status] - order[b.status];
  });
  const selected = bookings.find((b) => b.id === bookingId) ?? null;
  const committed = bookings.filter((b) => b.status === 'confirmed');

  useEffect(() => {
    if (params.get('new')) {
      const p = new URLSearchParams(params);
      p.delete('new');
      setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setBooking(id: string | null) {
    const p = new URLSearchParams(params);
    if (id) p.set('booking', id);else
    p.delete('booking');
    setParams(p, { replace: true });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Vendors & bookings</h2>
          <p className="text-sm text-smoke">{committed.length} confirmed · {bookings.filter((b) => b.status === 'requested').length} awaiting confirmation · {formatNaira(committed.reduce((a, b) => a + bookingFinance(db, b).outstanding, 0))} outstanding</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/app/vendors?event=${event.id}`} className={cx(btn.base, btn.outline, btn.md)}><Search className="h-4 w-4" aria-hidden="true" /> Find vendors</Link>
          <Button type="button" onClick={() => setAddOpen(true)} className={cx(btn.base, btn.outline, btn.md)}><Plus className="h-4 w-4" aria-hidden="true" /> Add your vendor</Button>
          <Button type="button" onClick={() => {setBookVendor(null);setBookOpen(true);}} className={cx(btn.base, btn.ink, btn.md)}>Book a vendor</Button>
        </div>
      </div>

      {bookings.length ?
      <ul className="grid gap-3 md:grid-cols-2">
          {bookings.map((b) => {
          const v = db.vendors.find((x) => x.id === b.vendorId);
          const f = bookingFinance(db, b);
          const depositDue = b.status === 'confirmed' && f.depositOutstanding > 0 && b.depositDueDate;
          return (
            <li key={b.id}>
                <button type="button" onClick={() => setBooking(b.id)} className={cx('w-full rounded-[1.4rem] border bg-white p-4 text-left transition hover:border-ink', bookingId === b.id ? 'border-ink ring-2 ring-ink' : 'border-line', (b.status === 'cancelled' || b.status === 'declined') && 'opacity-60')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{v?.name}</p>
                      <p className="truncate text-xs text-smoke">{v ? VENDOR_CATEGORY_LABELS[v.category] : ''} · {b.serviceName}</p>
                    </div>
                    <StatusPill tone={BOOKING_TONE[b.status]}>{BOOKING_STATUS_LABELS[b.status]}</StatusPill>
                  </div>
                  <ProgressBar value={f.paid} max={b.agreedAmount || 1} label={`${v?.name} paid`} size="sm" className="mt-4" />
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-smoke"><strong className="text-ink">{formatNaira(f.paid)}</strong> paid of {formatNaira(b.agreedAmount)}{f.pending > 0 && ` · ${formatNaira(f.pending)} pending`}</span>
                    {depositDue ? <span className="font-semibold text-coral">Deposit {formatNaira(f.depositOutstanding)} due {dueLabel(b.depositDueDate as string)}</span> : <ChevronRight className="h-4 w-4 text-smoke" aria-hidden="true" />}
                  </div>
                </button>
              </li>);

        })}
        </ul> :

      <EmptyState icon={Store} title="No vendors booked yet" message="Browse the directory or record a vendor you already work with." action={<Link to={`/app/vendors?event=${event.id}`} className={cx(btn.base, btn.ink, btn.md)}>Find vendors</Link>} />
      }

      <AddVendorDialog open={addOpen} onOpenChange={setAddOpen} onCreated={(v) => {setBookVendor(v.id);setBookOpen(true);}} />
      <BookingDialog event={event} open={bookOpen} onOpenChange={setBookOpen} vendorId={bookVendor} />
      <BookingDetailSheet event={event} booking={selected} onClose={() => setBooking(null)} onPay={(id, amount) => setPayPreset({ bookingId: id, amount })} />
      <PaymentDialog event={event} open={!!payPreset} onOpenChange={(o) => !o && setPayPreset(null)} preset={payPreset} />
    </div>);

}