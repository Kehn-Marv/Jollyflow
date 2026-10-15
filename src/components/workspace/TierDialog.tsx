import React, { useEffect, useState } from 'react';
import type { EventRecord, TicketTier, TierStatus } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { koboToInput, parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  tier: TicketTier | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function TierDialog({ event, tier, open, onOpenChange }: Props) {
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [max, setMax] = useState('6');
  const [status, setStatus] = useState<TierStatus>('on_sale');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(tier?.name ?? '');
    setDescription(tier?.description ?? '');
    setPrice(tier ? koboToInput(tier.price) : '');
    setQuantity(tier ? String(tier.quantity) : '');
    setMax(String(tier?.maxPerOrder ?? 6));
    setStatus(tier?.status ?? 'on_sale');
    setErrors({});
  }, [open, tier]);

  async function save() {
    const p = parseNairaInput(price);
    const q = Number(quantity);
    const m = Number(max);
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Name the tier.';
    if (p === null) e.price = 'Enter a price (0 for free).';
    if (!Number.isInteger(q) || q < 1) e.quantity = 'Enter a whole number.';
    if (!Number.isInteger(m) || m < 1 || m > 20) e.max = '1 to 20.';
    setErrors(e);
    if (Object.keys(e).length || p === null) return;
    const input = { eventId: event.id, name, description, price: p, quantity: q, maxPerOrder: m, status };
    const ok = await run(() => tier ? service.updateTicketTier(tier.id, input) : service.addTicketTier(input), { success: tier ? 'Tier updated' : 'Tier created' });
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={tier ? 'Edit ticket tier' : 'New ticket tier'} submitLabel="Save tier" pending={pending} onSubmit={save}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" htmlFor="tt-name" error={errors.name}>
          <Input {...fieldA11y('tt-name', errors.name)} value={name} onChange={(e) => setName(e.target.value)} placeholder="VIP" className={inputClass} />
        </FormField>
        <FormField label="Price" htmlFor="tt-price" error={errors.price}>
          <MoneyInput {...fieldA11y('tt-price', errors.price)} value={price} onChange={(e) => setPrice(e.target.value)} />
        </FormField>
        <FormField label="Quantity available" htmlFor="tt-qty" error={errors.quantity}>
          <Input {...fieldA11y('tt-qty', errors.quantity)} inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ''))} className={inputClass} />
        </FormField>
        <FormField label="Max per order" htmlFor="tt-max" error={errors.max}>
          <Input {...fieldA11y('tt-max', errors.max)} inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ''))} className={inputClass} />
        </FormField>
      </div>
      <FormField label="What’s included" htmlFor="tt-desc" optional>
        <Input id="tt-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </FormField>
      <FormField label="Status" htmlFor="tt-status">
        <NativeSelect id="tt-status" value={status} onChange={(e) => setStatus(e.target.value as TierStatus)}>
          <option value="on_sale">On sale</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option>
        </NativeSelect>
      </FormField>
    </FormDialog>);

}