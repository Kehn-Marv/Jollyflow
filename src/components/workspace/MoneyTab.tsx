import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, Banknote, HandCoins, Info, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { BudgetCategory, BudgetItem, EventRecord, PaymentStatus, TransactionKind } from '../../types/domain';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { budgetItemPaid, summariseEvent } from '../../utils/finance';
import { fmtShortDate } from '../../utils/dates';
import { formatNaira } from '../../utils/money';
import { BudgetMeter } from '../money/BudgetMeter';
import { BudgetItemDialog } from './BudgetItemDialog';
import { CategoryDialog } from './CategoryDialog';
import { ContributionDialog } from './ContributionDialog';
import { PaymentDialog, type PaymentPreset } from './PaymentDialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { PAYMENT_LABEL, PAYMENT_TONE, StatusPill } from '../ui/StatusPill';
import { DemoTag } from '../ui/DemoTag';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

const KIND_LABEL: Record<TransactionKind, string> = {
  vendor_payment: 'Vendor payment', expense_payment: 'Expense', contribution: 'Contribution', gift_contribution: 'Gift contribution', ticket_sale: 'Ticket sale'
};

export function MoneyTab({ event }: {event: EventRecord;}) {
  const db = useDb();
  const [params, setParams] = useSearchParams();
  const txnHighlight = params.get('txn');
  const fin = summariseEvent(db, event.id);
  const items = db.budgetItems.filter((i) => i.eventId === event.id);
  const { pending, run } = useAsyncAction();

  const [itemDialog, setItemDialog] = useState<{open: boolean;item: BudgetItem | null;}>({ open: params.get('new') === 'item', item: null });
  const [catDialog, setCatDialog] = useState<{open: boolean;cat: BudgetCategory | null;}>({ open: false, cat: null });
  const [payPreset, setPayPreset] = useState<PaymentPreset | null>(null);
  const [contribOpen, setContribOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BudgetItem | null>(null);
  const [dir, setDir] = useState<'all' | 'out' | 'in'>('all');
  const [statusF, setStatusF] = useState<'all' | PaymentStatus>('all');

  const txns = useMemo(
    () => db.transactions.filter((t) => t.eventId === event.id).filter((t) => dir === 'all' || t.direction === dir).filter((t) => statusF === 'all' || t.status === statusF).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.transactions, event.id, dir, statusF]
  );

  useEffect(() => {
    if (params.get('new')) {
      const p = new URLSearchParams(params);
      p.delete('new');
      setParams(p, { replace: true });
    }
    if (txnHighlight) window.setTimeout(() => document.getElementById(`txn-${txnHighlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tiles = [
  { label: 'Total budget', value: fin.budget, hint: 'What you set for the event' },
  { label: 'Committed', value: fin.committed, hint: 'Confirmed bookings + committed items' },
  { label: 'Paid', value: fin.paid, hint: 'Confirmed outgoing payments only' },
  { label: 'Outstanding', value: fin.outstanding, hint: 'Committed − paid', accent: 'text-coral' },
  { label: 'Received', value: fin.received, hint: 'Confirmed incoming money', accent: 'text-forest' },
  { label: 'Pending in', value: fin.incomingPending, hint: 'Not counted until confirmed' }];


  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">Budget & money <DemoTag>Simulated</DemoTag></h2>
          <p className="text-sm text-smoke">Planned, committed, paid and pending are always kept separate.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setContribOpen(true)} className={cx(btn.base, btn.outline, btn.md)}><HandCoins className="h-4 w-4" aria-hidden="true" /> Contribution</Button>
          <Button type="button" onClick={() => setPayPreset({})} className={cx(btn.base, btn.outline, btn.md)}><Banknote className="h-4 w-4" aria-hidden="true" /> Record payment</Button>
          <Button type="button" onClick={() => setItemDialog({ open: true, item: null })} className={cx(btn.base, btn.ink, btn.md)}><Plus className="h-4 w-4" aria-hidden="true" /> Budget item</Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) =>
        <div key={t.label} className="rounded-2xl border border-line bg-white p-4">
            <dt className="text-xs font-medium text-smoke">{t.label}</dt>
            <dd className={cx('mt-1 font-display text-xl font-bold tabular-nums', t.accent ?? 'text-ink')}>{formatNaira(t.value)}</dd>
            <dd className="mt-0.5 text-[11px] leading-tight text-smoke">{t.hint}</dd>
          </div>
        )}
      </dl>

      <section className="grid gap-5 rounded-[1.4rem] border-2 border-ink bg-white p-5 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-sm text-smoke">Remaining budget</p>
          <p className={cx('font-display text-4xl font-bold tabular-nums', fin.remaining < 0 ? 'text-danger' : 'text-ink')}>{formatNaira(fin.remaining)}</p>
          <details className="mt-3 rounded-xl bg-paper p-3 text-sm">
            <summary className="flex cursor-pointer items-center gap-1.5 font-semibold text-ink"><Info className="h-4 w-4" aria-hidden="true" /> How is this calculated?</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-smoke">
              <li><strong className="text-ink">Remaining = Total budget − Committed.</strong></li>
              <li>Committed includes confirmed bookings and committed items, paid or not.</li>
              <li>Estimates and booking requests are not committed.</li>
              <li>Pending and failed payments never count as paid.</li>
              <li>Contributions and ticket sales are shown as Received and never added to the budget.</li>
            </ul>
          </details>
        </div>
        <BudgetMeter summary={fin} />
      </section>

      <section className="rounded-[1.4rem] border border-line bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-line p-4">
          <h3 className="font-display text-lg font-semibold text-ink">Categories</h3>
          <Button type="button" onClick={() => setCatDialog({ open: true, cat: null })} className={cx(btn.base, btn.ghost, btn.sm)}><Plus className="h-4 w-4" aria-hidden="true" /> Category</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-smoke">
              <tr><th className="px-4 py-2 font-medium">Category</th><th className="px-4 py-2 text-right font-medium">Planned</th><th className="px-4 py-2 text-right font-medium">Estimates</th><th className="px-4 py-2 text-right font-medium">Committed</th><th className="px-4 py-2 text-right font-medium">Paid</th><th className="w-40 px-4 py-2 font-medium">Use of plan</th><th className="px-2" /></tr>
            </thead>
            <tbody>
              {fin.categories.map((c) => {
                const pct = c.planned ? Math.min(100, c.committed / c.planned * 100) : 0;
                const over = c.planned > 0 && c.committed > c.planned;
                return (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-4 py-3 font-semibold text-ink">{c.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNaira(c.planned)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-smoke">{formatNaira(c.estimates)}</td>
                    <td className={cx('px-4 py-3 text-right tabular-nums', over && 'font-semibold text-danger')}>{formatNaira(c.committed)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatNaira(c.paid)}</td>
                    <td className="px-4 py-3">
                      <div className="h-2 overflow-hidden rounded-full bg-sand" role="img" aria-label={`${Math.round(pct)}% of planned committed${over ? ', over plan' : ''}`}>
                        <div className={cx('h-full', over ? 'bg-danger' : 'bg-ink')} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-2"><button type="button" onClick={() => setCatDialog({ open: true, cat: db.budgetCategories.find((x) => x.id === c.id) ?? null })} aria-label={`Edit ${c.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Pencil className="h-4 w-4" aria-hidden="true" /></button></td>
                  </tr>);

              })}
              {!fin.categories.length && <tr><td colSpan={7} className="px-4 py-6 text-center text-smoke">No categories yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-line bg-white">
        <div className="flex items-center justify-between gap-2 border-b border-line p-4">
          <h3 className="font-display text-lg font-semibold text-ink">Other costs</h3>
          <p className="text-xs text-smoke">Vendor bookings are tracked under Vendors</p>
        </div>
        {items.length ?
        <ul>
            {items.map((i) => {
            const paid = budgetItemPaid(db, i.id);
            return (
              <li key={i.id} className="flex flex-wrap items-center gap-3 border-b border-line p-4 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{i.label}</p>
                    <p className="text-xs text-smoke">{db.budgetCategories.find((c) => c.id === i.categoryId)?.name}{i.note ? ` · ${i.note}` : ''}</p>
                  </div>
                  <StatusPill tone={i.status === 'committed' ? 'dark' : 'neutral'}>{i.status === 'committed' ? 'Committed' : 'Estimate'}</StatusPill>
                  <span className="w-36 text-right text-sm tabular-nums"><strong>{formatNaira(i.amount)}</strong><span className="block text-xs text-smoke">{formatNaira(paid)} paid</span></span>
                  <div className="flex gap-0.5">
                    {paid < i.amount && <button type="button" onClick={() => setPayPreset({ budgetItemId: i.id })} aria-label={`Record payment for ${i.label}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Banknote className="h-4 w-4" aria-hidden="true" /></button>}
                    <button type="button" onClick={() => setItemDialog({ open: true, item: i })} aria-label={`Edit ${i.label}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-ink"><Pencil className="h-4 w-4" aria-hidden="true" /></button>
                    <button type="button" onClick={() => setToDelete(i)} aria-label={`Delete ${i.label}`} className="grid h-9 w-9 place-items-center rounded-lg text-smoke hover:bg-sand hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                  </div>
                </li>);

          })}
          </ul> :
        <p className="p-6 text-center text-sm text-smoke">No other costs yet. Add venue hire, attire, souvenirs and more.</p>}
      </section>

      <section className="rounded-[1.4rem] border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Transactions</h3>
          <div className="flex flex-wrap gap-2">
            {(['all', 'out', 'in'] as const).map((d) =>
            <button key={d} type="button" aria-pressed={dir === d} onClick={() => setDir(d)} className={cx('rounded-full border px-3 py-1 text-xs font-semibold', dir === d ? 'border-ink bg-ink text-paper' : 'border-line text-ink hover:border-ink')}>{d === 'all' ? 'All' : d === 'out' ? 'Outgoing' : 'Incoming'}</button>
            )}
            <span className="w-px bg-line" aria-hidden="true" />
            {(['all', 'success', 'pending', 'failed'] as const).map((s) =>
            <button key={s} type="button" aria-pressed={statusF === s} onClick={() => setStatusF(s)} className={cx('rounded-full border px-3 py-1 text-xs font-semibold', statusF === s ? 'border-ink bg-ink text-paper' : 'border-line text-ink hover:border-ink')}>{s === 'all' ? 'Any status' : PAYMENT_LABEL[s]}</button>
            )}
          </div>
        </div>
        {txns.length ?
        <ul>
            {txns.map((t) =>
          <li key={t.id} id={`txn-${t.id}`} className={cx('flex flex-wrap items-center gap-3 border-b border-line p-4 last:border-0', txnHighlight === t.id && 'bg-lime/25 ring-2 ring-inset ring-ink')}>
                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full', t.direction === 'in' ? 'bg-[#E1F1DE] text-ok' : 'bg-[#FFE7DF] text-[#9C3418]')}>
                  {t.direction === 'in' ? <ArrowDownLeft className="h-4 w-4" aria-label="Incoming" /> : <ArrowUpRight className="h-4 w-4" aria-label="Outgoing" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{t.counterparty}</p>
                  <p className="truncate text-xs text-smoke">{KIND_LABEL[t.kind]} · {fmtShortDate(t.createdAt)} · <span className="font-mono">{t.reference}</span>{t.note ? ` · ${t.note}` : ''}</p>
                </div>
                <span className="text-right font-semibold tabular-nums text-ink">{t.direction === 'in' ? '+' : '−'}{formatNaira(t.amount)}</span>
                <StatusPill tone={PAYMENT_TONE[t.status]}>{PAYMENT_LABEL[t.status]}</StatusPill>
                {t.status === 'pending' && t.kind !== 'ticket_sale' &&
            <div className="flex w-full gap-2 sm:w-auto">
                    <Button type="button" disabled={pending} onClick={() => run(() => service.settleTransaction(t.id, 'success'), { success: 'Marked as confirmed (simulated)' })} className={cx(btn.base, btn.lime, btn.sm, 'h-8')}>Confirm</Button>
                    <Button type="button" disabled={pending} onClick={() => run(() => service.settleTransaction(t.id, 'failed'), { success: 'Marked as failed' })} className={cx(btn.base, btn.outline, btn.sm, 'h-8')}>Failed</Button>
                  </div>
            }
                {t.status === 'failed' && t.direction === 'out' &&
            <Button type="button" onClick={() => setPayPreset({ bookingId: t.bookingId ?? undefined, budgetItemId: t.budgetItemId ?? undefined, amount: t.amount })} className={cx(btn.base, btn.outline, btn.sm, 'h-8')}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
                  </Button>
            }
              </li>
          )}
          </ul> :
        <p className="p-6 text-center text-sm text-smoke">No transactions match these filters.</p>}
        <p className="border-t border-line p-4 text-xs text-smoke">All transactions are simulated. “Confirm” stands in for verification that a real payment provider will perform in the backend phase.</p>
      </section>

      <BudgetItemDialog event={event} item={itemDialog.item} open={itemDialog.open} onOpenChange={(o) => setItemDialog((d) => ({ ...d, open: o }))} />
      <CategoryDialog event={event} category={catDialog.cat} open={catDialog.open} onOpenChange={(o) => setCatDialog((d) => ({ ...d, open: o }))} />
      <PaymentDialog event={event} open={!!payPreset} onOpenChange={(o) => !o && setPayPreset(null)} preset={payPreset} />
      <ContributionDialog event={event} open={contribOpen} onOpenChange={setContribOpen} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete budget item?"
        message={`“${toDelete?.label}” will be removed from the budget.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await run(() => service.deleteBudgetItem(toDelete.id).then(() => true), { success: 'Budget item deleted' });
          if (ok) setToDelete(null);
        }} />
      
    </div>);

}