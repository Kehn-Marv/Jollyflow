import React, { useEffect, useState } from 'react';
import type { EventRecord, GiftItem, GiftKind } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { koboToInput, parseNairaInput } from '../../utils/money';
import { cx, inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  gift: GiftItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function GiftDialog({ event, gift, open, onOpenChange }: Props) {
  const { pending, run } = useAsyncAction();
  const [kind, setKind] = useState<GiftKind>('physical');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setKind(gift?.kind ?? 'physical');
    setName(gift?.name ?? '');
    setDescription(gift?.description ?? '');
    const a = gift?.kind === 'cash_fund' ? gift.targetAmount : gift?.priceHint;
    setAmount(a ? koboToInput(a) : '');
    setErrors({});
  }, [open, gift]);

  async function save() {
    const kobo = amount.trim() ? parseNairaInput(amount) : null;
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Name the gift.';
    if (amount.trim() && kobo === null) e.amount = 'Enter a valid amount.';
    if (kind === 'cash_fund' && !kobo) e.amount = 'Cash funds need a target amount.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const input = { eventId: event.id, name, description, kind, targetAmount: kind === 'cash_fund' ? kobo : null, priceHint: kind === 'physical' ? kobo : null };
    const ok = await run(() => gift ? service.updateGiftItem(gift.id, input) : service.addGiftItem(input), { success: gift ? 'Gift updated' : 'Added to wishlist' });
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={gift ? 'Edit gift' : 'Add to wishlist'} submitLabel={gift ? 'Save' : 'Add gift'} pending={pending} onSubmit={save}>
      {!gift &&
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Gift type">
          {([['physical', 'Physical gift', 'Guests reserve it and bring it'], ['cash_fund', 'Cash fund', 'Guests contribute towards a target']] as const).map(([k, t, b]) =>
        <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={cx('rounded-2xl border-2 p-3 text-left', kind === k ? 'border-ink bg-lime/50' : 'border-line hover:border-ink')}>
              <span className="block font-semibold text-ink">{t}</span><span className="text-xs text-smoke">{b}</span>
            </button>
        )}
        </div>
      }
      <FormField label="Name" htmlFor="gf-name" error={errors.name}>
        <Input {...fieldA11y('gf-name', errors.name)} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label="Description" htmlFor="gf-desc" optional>
        <Input id="gf-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label={kind === 'cash_fund' ? 'Target amount' : 'Approximate price'} htmlFor="gf-amount" optional={kind === 'physical'} error={errors.amount}>
        <MoneyInput {...fieldA11y('gf-amount', errors.amount)} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </FormField>
    </FormDialog>);

}