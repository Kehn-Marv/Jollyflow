import React, { useState } from 'react';
import { Gift, HandCoins, PackageCheck, Pencil, Plus, Trash2, Undo2, UserCheck } from 'lucide-react';
import type { EventRecord, GiftItem } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { giftRaised } from '../../utils/finance';
import { formatNaira, percent } from '../../utils/money';
import { publicEventUrl } from '../../utils/events';
import { GiftDialog } from './GiftDialog';
import { ContributionDialog } from './ContributionDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { FormDialog } from '../ui/FormDialog';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { CopyButton } from '../ui/CopyButton';
import { EmptyState } from '../ui/EmptyState';
import { ProgressBar } from '../ui/ProgressBar';
import { PAYMENT_LABEL, PAYMENT_TONE, StatusPill } from '../ui/StatusPill';
import { Button } from '../ui/Button';
import { btn, cx, inputClass } from '../../utils/styles';

export function GiftsTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const gifts = db.giftItems.filter((g) => g.eventId === event.id);
  const { pending, run } = useAsyncAction();
  const [dialog, setDialog] = useState<{open: boolean;gift: GiftItem | null;}>({ open: false, gift: null });
  const [contribFor, setContribFor] = useState<string | null>(null);
  const [reserveFor, setReserveFor] = useState<GiftItem | null>(null);
  const [reserveName, setReserveName] = useState('');
  const [receivedFor, setReceivedFor] = useState<GiftItem | null>(null);
  const [toDelete, setToDelete] = useState<GiftItem | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Gifts & contributions</h2>
          <p className="text-sm text-smoke">Reserved isn’t received, and only confirmed contributions count towards a target.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === 'published' && <CopyButton value={`${publicEventUrl(event)}#gifts`} label="Copy gift link" />}
          <Button type="button" onClick={() => setContribFor('')} className={cx(btn.base, btn.outline, btn.md)}><HandCoins className="h-4 w-4" aria-hidden="true" /> Record contribution</Button>
          <Button type="button" onClick={() => setDialog({ open: true, gift: null })} className={cx(btn.base, btn.ink, btn.md)}><Plus className="h-4 w-4" aria-hidden="true" /> Add gift</Button>
        </div>
      </div>

      {gifts.length ?
      <ul className="grid gap-4 md:grid-cols-2">
          {gifts.map((g) => {
          const r = giftRaised(db, g.id);
          const contribs = db.transactions.filter((t) => t.giftItemId === g.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          return (
            <li key={g.id} className="flex flex-col rounded-[1.4rem] border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink', g.kind === 'cash_fund' ? 'bg-lime' : 'bg-sky')}>
                      {g.kind === 'cash_fund' ? <HandCoins className="h-4 w-4" aria-hidden="true" /> : <Gift className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{g.name}</p>
                      <p className="text-sm text-smoke">{g.description}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <button type="button" onClick={() => setDialog({ open: true, gift: g })} aria-label={`Edit ${g.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                    <button type="button" onClick={() => setToDelete(g)} aria-label={`Delete ${g.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </div>

                {g.kind === 'cash_fund' ?
              <div className="mt-4 flex flex-1 flex-col">
                    <div className="flex items-baseline justify-between">
                      <p className="font-display text-2xl font-bold tabular-nums text-ink">{formatNaira(r.raised)}</p>
                      <p className="text-sm text-smoke">of {formatNaira(g.targetAmount ?? 0)} · {percent(r.raised, g.targetAmount ?? 0)}%</p>
                    </div>
                    <ProgressBar value={r.raised} max={g.targetAmount ?? 1} label={`${g.name} progress`} className="mt-2" />
                    {r.pending > 0 && <p className="mt-2 text-xs text-[#9C3418]">{formatNaira(r.pending)} pending — not counted yet</p>}
                    {contribs.length > 0 &&
                <ul className="mt-3 space-y-1">
                        {contribs.slice(0, 4).map((t) =>
                  <li key={t.id} className="flex items-center gap-2 text-sm">
                            <span className="min-w-0 flex-1 truncate text-ink">{t.counterparty}</span>
                            <span className="tabular-nums">{formatNaira(t.amount)}</span>
                            <StatusPill tone={PAYMENT_TONE[t.status]}>{PAYMENT_LABEL[t.status]}</StatusPill>
                          </li>
                  )}
                      </ul>
                }
                    <Button type="button" onClick={() => setContribFor(g.id)} className={cx(btn.base, btn.soft, btn.sm, 'mt-4 self-start')}>Record contribution</Button>
                  </div> :

              <div className="mt-4 flex flex-1 flex-col justify-end">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone={g.status === 'received' ? 'success' : g.status === 'reserved' ? 'info' : 'neutral'} icon={g.status === 'received' ? PackageCheck : g.status === 'reserved' ? UserCheck : undefined}>
                        {g.status === 'received' ? 'Received' : g.status === 'reserved' ? `Reserved by ${g.reservedBy}` : 'Available'}
                      </StatusPill>
                      {g.priceHint && <span className="text-sm text-smoke">≈ {formatNaira(g.priceHint)}</span>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.status === 'available' && <Button type="button" onClick={() => {setReserveName('');setReserveFor(g);}} className={cx(btn.base, btn.soft, btn.sm)}>Mark reserved</Button>}
                      {g.status === 'reserved' &&
                  <>
                          <Button type="button" onClick={() => setReceivedFor(g)} className={cx(btn.base, btn.lime, btn.sm)}><PackageCheck className="h-4 w-4" aria-hidden="true" /> Mark received</Button>
                          <Button type="button" disabled={pending} onClick={() => run(() => service.releaseGift(g.id), { success: 'Reservation released' })} className={cx(btn.base, btn.ghost, btn.sm)}><Undo2 className="h-4 w-4" aria-hidden="true" /> Release</Button>
                        </>
                  }
                    </div>
                  </div>
              }
              </li>);

        })}
        </ul> :

      <EmptyState icon={Gift} title="Your wishlist is empty" message="Add physical gifts guests can reserve, or a cash fund with a target." action={<Button type="button" onClick={() => setDialog({ open: true, gift: null })} className={cx(btn.base, btn.ink, btn.md)}>Add a gift</Button>} />
      }

      <GiftDialog event={event} gift={dialog.gift} open={dialog.open} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
      <ContributionDialog event={event} open={contribFor !== null} onOpenChange={(o) => !o && setContribFor(null)} giftItemId={contribFor || null} />
      <FormDialog
        open={!!reserveFor}
        onOpenChange={(o) => !o && setReserveFor(null)}
        title="Mark as reserved"
        description="Record who said they’ll bring this gift."
        submitLabel="Reserve"
        pending={pending}
        onSubmit={async () => {
          if (!reserveFor || reserveName.trim().length < 2) return;
          const ok = await run(() => service.reserveGift(reserveFor.id, reserveName), { success: 'Gift reserved' });
          if (ok) setReserveFor(null);
        }}>
        
        <FormField label="Reserved by" htmlFor="rs-name" hint="At least 2 characters.">
          <Input id="rs-name" value={reserveName} onChange={(e) => setReserveName(e.target.value)} className={inputClass} autoFocus />
        </FormField>
      </FormDialog>
      <ConfirmDialog
        open={!!receivedFor}
        onOpenChange={(o) => !o && setReceivedFor(null)}
        title="Confirm you’ve received it?"
        message={`Only mark “${receivedFor?.name}” as received once it’s physically in your hands.`}
        confirmLabel="Yes, received"
        destructive={false}
        pending={pending}
        onConfirm={async () => {
          if (!receivedFor) return;
          const ok = await run(() => service.markGiftReceived(receivedFor.id), { success: 'Marked as received' });
          if (ok) setReceivedFor(null);
        }} />
      
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete gift?"
        message={`“${toDelete?.name}” will be removed from the wishlist.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await run(() => service.deleteGiftItem(toDelete.id).then(() => true), { success: 'Gift deleted' });
          if (ok) setToDelete(null);
        }} />
      
    </div>);

}