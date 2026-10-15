import React, { useEffect, useMemo, useState } from 'react';
import type { EventRecord, PaymentStatus } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { bookingFinance, budgetItemPaid } from '../../utils/finance';
import { formatNaira, koboToInput, parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

export interface PaymentPreset {
  bookingId?: string;
  budgetItemId?: string;
  amount?: number;
}

interface Props {
  event: EventRecord;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preset?: PaymentPreset | null;
}

export function PaymentDialog({ event, open, onOpenChange, preset }: Props) {
  const db = useDb();
  const { pending, run } = useAsyncAction();
  const options = useMemo(() => {
    const b = db.bookings.filter((x) => x.eventId === event.id && x.status === 'confirmed').map((x) => {
      const f = bookingFinance(db, x);
      const v = db.vendors.find((y) => y.id === x.vendorId);
      return { value: `b:${x.id}`, label: `${v?.name ?? 'Vendor'} — ${x.serviceName}`, outstanding: f.outstanding, pending: f.pending };
    });
    const i = db.budgetItems.filter((x) => x.eventId === event.id).map((x) => ({ value: `i:${x.id}`, label: `${x.label}${x.status === 'estimate' ? ' (estimate)' : ''}`, outstanding: Math.max(0, x.amount - budgetItemPaid(db, x.id)), pending: 0 }));
    return [...b, ...i];
  }, [db, event.id]);

  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{target?: string;amount?: string;}>({});

  useEffect(() => {
    if (!open) return;
    const t = preset?.bookingId ? `b:${preset.bookingId}` : preset?.budgetItemId ? `i:${preset.budgetItemId}` : options[0]?.value ?? '';
    setTarget(t);
    const opt = options.find((o) => o.value === t);
    setAmount(preset?.amount ? koboToInput(preset.amount) : opt ? koboToInput(Math.max(0, opt.outstanding - opt.pending)) : '');
    setStatus('pending');
    setNote('');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = options.find((o) => o.value === target);

  async function save() {
    const kobo = parseNairaInput(amount);
    const e = { target: !target ? 'Choose what this payment is for.' : undefined, amount: !kobo ? 'Enter an amount greater than zero.' : undefined };
    setErrors(e);
    if (e.target || e.amount || !kobo) return;
    const [kind, id] = target.split(':');
    const ok = await run(
      () => service.recordPayment({ eventId: event.id, bookingId: kind === 'b' ? id : null, budgetItemId: kind === 'i' ? id : null, amount: kobo, status, note }),
      { success: status === 'success' ? 'Payment recorded as confirmed' : status === 'pending' ? 'Payment recorded as pending — not counted as paid yet' : 'Failed payment recorded' }
    );
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Record a payment" description="Simulated record. No money moves — this tracks a payment you made elsewhere." submitLabel="Record payment" pending={pending} onSubmit={save}>
      {options.length === 0 ?
      <p className="rounded-xl bg-sand p-4 text-sm text-smoke">Add a confirmed booking or a budget item first — every payment must belong to one.</p> :

      <>
          <FormField label="Paying for" htmlFor="pay-target" error={errors.target}>
            <NativeSelect id="pay-target" value={target} onChange={(e) => setTarget(e.target.value)}>
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
          </FormField>
          {selected &&
        <p className="rounded-xl bg-paper px-3 py-2 text-sm text-smoke">
              Outstanding: <strong className="text-ink">{formatNaira(selected.outstanding)}</strong>
              {selected.pending > 0 && <> · {formatNaira(selected.pending)} already pending</>}
            </p>
        }
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Amount" htmlFor="pay-amount" error={errors.amount}>
              <MoneyInput {...fieldA11y('pay-amount', errors.amount)} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </FormField>
            <FormField label="Status" htmlFor="pay-status">
              <NativeSelect id="pay-status" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)}>
                <option value="pending">Pending — awaiting confirmation</option>
                <option value="success">Confirmed — money received by vendor</option>
                <option value="failed">Failed</option>
              </NativeSelect>
            </FormField>
          </div>
          <FormField label="Note" htmlFor="pay-note" optional>
            <Input id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Deposit via transfer" className={inputClass} />
          </FormField>
        </>
      }
    </FormDialog>);

}