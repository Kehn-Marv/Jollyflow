import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import type { Booking, EventRecord } from '../../types/domain';
import { SidePanel } from '../ui/SidePanel';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { bookingFinance } from '../../utils/finance';
import { dueLabel, fmtDate, fmtShortDate } from '../../utils/dates';
import { formatNaira } from '../../utils/money';
import { BOOKING_STATUS_LABELS, VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { BOOKING_TONE, PAYMENT_LABEL, PAYMENT_TONE, StatusPill } from '../ui/StatusPill';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

interface Props {
  event: EventRecord;
  booking: Booking | null;
  onClose: () => void;
  onPay: (bookingId: string, amount?: number) => void;
}

export function BookingDetailSheet({ event, booking, onClose, onPay }: Props) {
  const db = useDb();
  const { pending, run } = useAsyncAction();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const vendor = booking ? db.vendors.find((v) => v.id === booking.vendorId) : undefined;
  const fin = booking ? bookingFinance(db, booking) : null;
  const txns = booking ? db.transactions.filter((t) => t.bookingId === booking.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  const cat = booking ? db.budgetCategories.find((c) => c.id === booking.categoryId) : undefined;

  return (
    <SidePanel
      open={!!booking}
      onOpenChange={(o) => !o && onClose()}
      width="lg"
      eyebrow={booking &&
      <>
          <StatusPill tone={BOOKING_TONE[booking.status]}>{BOOKING_STATUS_LABELS[booking.status]}</StatusPill>
          {vendor && <StatusPill>{VENDOR_CATEGORY_LABELS[vendor.category]}</StatusPill>}
        </>
      }
      title={vendor?.name ?? 'Booking'}
      description={booking ? `${booking.serviceName} · ${event.title}` : undefined}>
      
        {booking && fin &&
      <>
            <div className="space-y-6 p-6">
              <section>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold text-ink">Payment progress</h3>
                  <span className="text-sm tabular-nums text-smoke">{formatNaira(fin.paid)} of {formatNaira(booking.agreedAmount)}</span>
                </div>
                <ProgressBar value={fin.paid} max={booking.agreedAmount} label="Paid towards booking" className="mt-2" />
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-paper p-3"><dt className="text-xs text-smoke">Agreed</dt><dd className="font-semibold tabular-nums">{formatNaira(booking.agreedAmount)}</dd></div>
                  <div className="rounded-xl bg-paper p-3"><dt className="text-xs text-smoke">Paid (confirmed)</dt><dd className="font-semibold tabular-nums">{formatNaira(fin.paid)}</dd></div>
                  <div className="rounded-xl bg-paper p-3"><dt className="text-xs text-smoke">Pending</dt><dd className="font-semibold tabular-nums">{formatNaira(fin.pending)}</dd></div>
                  <div className="rounded-xl bg-paper p-3"><dt className="text-xs text-smoke">Outstanding</dt><dd className="font-semibold tabular-nums text-coral">{formatNaira(booking.status === 'confirmed' ? fin.outstanding : 0)}</dd></div>
                </dl>
                {booking.status !== 'confirmed' && <p className="mt-2 text-xs text-smoke">Not counted as committed spend until the booking is confirmed.</p>}
              </section>
              <section className="text-sm">
                <h3 className="font-semibold text-ink">Terms</h3>
                <dl className="mt-2 divide-y divide-line rounded-xl border border-line">
                  <div className="flex items-start justify-between gap-4 px-3.5 py-2.5">
                    <dt className="shrink-0 text-smoke">Deposit</dt>
                    <dd className="text-right">
                      <span className="tabular-nums text-ink">{formatNaira(booking.depositAmount)}</span>
                      {booking.depositAmount > 0 && fin.depositOutstanding === 0 && <span className="ml-1.5 font-medium text-forest">· paid</span>}
                      {booking.depositDueDate && <span className="block text-xs text-smoke">Due {fmtDate(booking.depositDueDate)} · {dueLabel(booking.depositDueDate)}</span>}
                    </dd>
                  </div>
                  {booking.balanceDueDate &&
              <div className="flex items-center justify-between gap-4 px-3.5 py-2.5"><dt className="text-smoke">Balance due</dt><dd className="text-right text-ink">{fmtDate(booking.balanceDueDate)}</dd></div>
              }
                  <div className="flex items-center justify-between gap-4 px-3.5 py-2.5"><dt className="text-smoke">Budget category</dt><dd className="text-right text-ink">{cat?.name ?? 'Uncategorised'}</dd></div>
                </dl>
                {booking.notes && <p className="mt-2 whitespace-pre-line rounded-xl bg-paper p-3 text-ink">{booking.notes}</p>}
              </section>
              <section>
                <h3 className="font-semibold text-ink">Payments · simulated</h3>
                {txns.length ?
            <ul className="mt-2 space-y-1.5">
                    {txns.map((t) =>
              <li key={t.id} className="flex items-start gap-3 rounded-xl border border-line px-3.5 py-3 text-sm">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-ink">{t.note || 'Payment'}</span>
                          <span className="mt-0.5 block truncate font-mono text-[11px] text-smoke">{t.reference} · {fmtShortDate(t.createdAt)}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className="font-semibold tabular-nums">{formatNaira(t.amount)}</span>
                          <StatusPill tone={PAYMENT_TONE[t.status]}>{PAYMENT_LABEL[t.status]}</StatusPill>
                        </span>
                      </li>
              )}
                  </ul> :
            <p className="mt-2 text-sm text-smoke">No payments recorded yet.</p>}
              </section>
              <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                {booking.status === 'requested' &&
            <>
                    <Button type="button" disabled={pending} onClick={() => run(() => service.setBookingStatus(booking.id, 'confirmed'), { success: 'Booking confirmed — now counted as committed' })} className={cx(btn.base, btn.lime, btn.sm)}>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Vendor confirmed
                    </Button>
                    <Button type="button" disabled={pending} onClick={() => run(() => service.setBookingStatus(booking.id, 'declined'), { success: 'Marked as declined' })} className={cx(btn.base, btn.outline, btn.sm)}>
                      <XCircle className="h-4 w-4" aria-hidden="true" /> Vendor declined
                    </Button>
                  </>
            }
                {booking.status === 'confirmed' && fin.outstanding - fin.pending > 0 &&
            <Button type="button" onClick={() => onPay(booking.id, fin.depositOutstanding > 0 ? Math.max(0, fin.depositOutstanding - fin.pending) || undefined : undefined)} className={cx(btn.base, btn.ink, btn.sm)}>
                    <Banknote className="h-4 w-4" aria-hidden="true" /> Record payment
                  </Button>
            }
                {(booking.status === 'confirmed' || booking.status === 'requested') &&
            <Button type="button" onClick={() => setConfirmCancel(true)} className={cx(btn.base, btn.ghost, btn.sm, 'text-danger')}>Cancel booking</Button>
            }
                {vendor?.isMarketplace &&
            <Link to={`/app/vendors/${vendor.id}`} className={cx(btn.base, btn.ghost, btn.sm)}><ExternalLink className="h-4 w-4" aria-hidden="true" /> Vendor profile</Link>
            }
              </div>
              {booking.status === 'requested' && <p className="text-xs text-smoke">Vendor accounts aren’t live in this prototype, so you record the vendor’s response yourself.</p>}
            </div>
          </>
      }
        <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this booking?"
        message={fin && fin.paid > 0 ? `${formatNaira(fin.paid)} has already been paid. Cancelling removes it from committed spend; agree any refund with the vendor directly.` : 'It will no longer count towards committed spend.'}
        confirmLabel="Cancel booking"
        pending={pending}
        onConfirm={async () => {
          if (!booking) return;
          const ok = await run(() => service.setBookingStatus(booking.id, 'cancelled'), { success: 'Booking cancelled' });
          if (ok) setConfirmCancel(false);
        }} />
      
    </SidePanel>);

}