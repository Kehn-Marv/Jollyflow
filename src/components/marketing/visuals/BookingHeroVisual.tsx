import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useDb } from '../../../contexts/DataContext';
import { bookingFinance } from '../../../utils/finance';
import { formatNaira } from '../../../utils/money';
import { dueLabel } from '../../../utils/dates';
import { ProductFrame } from '../ProductFrame';
import { cx } from '../../../utils/styles';

/** One vendor booking, told as a journey from request to settled balance. */
export function BookingHeroVisual({ eventId = 'e_wedding' }: {eventId?: string;}) {
  const db = useDb();
  const reduce = useReducedMotion();
  const confirmed = db.bookings.filter((b) => b.eventId === eventId && b.status === 'confirmed');
  const booking =
  confirmed.find((b) => {
    const f = bookingFinance(db, b);
    return f.paid > 0 && f.outstanding > 0;
  }) ?? confirmed[0];
  if (!booking) return null;

  const vendor = db.vendors.find((v) => v.id === booking.vendorId);
  const fin = bookingFinance(db, booking);
  const pct = Math.min(100, fin.paid / Math.max(fin.agreed, 1) * 100);
  const others = confirmed.filter((b) => b.id !== booking.id).length;

  const steps = [
  { label: 'Requested', done: true },
  { label: 'Confirmed', done: true },
  { label: 'Deposit', done: fin.depositOutstanding === 0 },
  { label: 'Balance', done: fin.outstanding === 0 }];

  const current = steps.findIndex((s) => !s.done);

  return (
    <div className="relative pt-6">
      {/* Stack hint: more bookings behind this one */}
      <div className="absolute inset-x-10 top-0 h-16 rounded-[26px] border border-white/10 bg-white/[0.03]" aria-hidden="true" />
      <div className="absolute inset-x-5 top-3 h-16 rounded-[28px] border border-white/10 bg-white/[0.05]" aria-hidden="true" />

      <ProductFrame className="relative">
        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lime font-display text-sm font-bold" aria-hidden="true">
              {vendor?.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg font-semibold leading-tight">{vendor?.name}</p>
              <p className="truncate text-sm text-smoke">{booking.serviceName}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-forest" aria-hidden="true" />
              Confirmed
            </span>
          </div>

          <div className="mt-7">
            <p className="text-xs text-smoke">Agreed</p>
            <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight">{formatNaira(fin.agreed)}</p>
          </div>

          <div className="mt-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-sand" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-ink"
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
              
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-ink">{formatNaira(fin.paid)} paid</span>
              <span className="text-smoke">{formatNaira(fin.outstanding)} to go</span>
            </div>
          </div>

          {/* Journey */}
          <ol className="mt-7 grid grid-cols-4" aria-label="Booking progress">
            {steps.map((s, i) =>
            <li key={s.label} className="relative flex flex-col items-center text-center">
                {i > 0 && <span className={cx('absolute right-1/2 top-3 h-px w-full', steps[i - 1].done && s.done ? 'bg-ink' : 'bg-line')} aria-hidden="true" />}
                <span
                className={cx(
                  'relative grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold',
                  s.done ? 'bg-lime text-ink' : i === current ? 'border-[1.5px] border-ink bg-white' : 'border border-line bg-white text-smoke'
                )}>
                
                  {s.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
                </span>
                <span className={cx('mt-2 text-[11px]', s.done || i === current ? 'text-ink' : 'text-smoke')}>{s.label}</span>
              </li>
            )}
          </ol>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-xs text-smoke">
            <span>{booking.balanceDueDate ? `Balance due ${dueLabel(booking.balanceDueDate)}` : 'Balance date not set'}</span>
            {others > 0 && <span>+{others} more bookings</span>}
          </div>
        </div>
      </ProductFrame>
      <p className="sr-only">Live sample booking from the demo wedding.</p>
    </div>);

}