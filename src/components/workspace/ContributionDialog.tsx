import React, { useEffect, useState } from 'react';
import type { EventRecord } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  giftItemId?: string | null;
}

export function ContributionDialog({ event, open, onOpenChange, giftItemId }: Props) {
  const db = useDb();
  const funds = db.giftItems.filter((g) => g.eventId === event.id && g.kind === 'cash_fund');
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [gift, setGift] = useState('');
  const [status, setStatus] = useState<'pending' | 'success'>('pending');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName('');setAmount('');setGift(giftItemId ?? '');setStatus('pending');setNote('');setErrors({});
  }, [open, giftItemId]);

  async function save() {
    const kobo = parseNairaInput(amount);
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Who is contributing?';
    if (!kobo) e.amount = 'Enter an amount greater than zero.';
    setErrors(e);
    if (Object.keys(e).length || !kobo) return;
    const ok = await run(() => service.recordContribution({ eventId: event.id, giftItemId: gift || null, contributorName: name, amount: kobo, note, status }), {
      success: status === 'success' ? 'Contribution recorded as confirmed' : 'Contribution recorded as pending'
    });
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Record a contribution" description="For money given outside JolliFlow (e.g. a family transfer). Simulated record only." submitLabel="Record contribution" pending={pending} onSubmit={save}>
      <FormField label="Contributor" htmlFor="ct-name" error={errors.name}>
        <Input {...fieldA11y('ct-name', errors.name)} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Uncle Chuka" className={inputClass} autoFocus />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Amount" htmlFor="ct-amount" error={errors.amount}>
          <MoneyInput {...fieldA11y('ct-amount', errors.amount)} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </FormField>
        <FormField label="Status" htmlFor="ct-status">
          <NativeSelect id="ct-status" value={status} onChange={(e) => setStatus(e.target.value as 'pending' | 'success')}>
            <option value="pending">Pending — pledged / not yet confirmed</option>
            <option value="success">Confirmed — money received</option>
          </NativeSelect>
        </FormField>
      </div>
      <FormField label="Towards" htmlFor="ct-gift">
        <NativeSelect id="ct-gift" value={gift} onChange={(e) => setGift(e.target.value)}>
          <option value="">General event contribution</option>
          {funds.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </NativeSelect>
      </FormField>
      <FormField label="Message" htmlFor="ct-note" optional>
        <Input id="ct-note" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
      </FormField>
    </FormDialog>);

}