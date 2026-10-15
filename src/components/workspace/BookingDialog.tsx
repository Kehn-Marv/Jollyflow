import React, { useEffect, useState } from 'react';
import type { BookingStatus, EventRecord } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { combineDateTime } from '../../utils/dates';
import { koboToInput, parseNairaInput } from '../../utils/money';
import { VENDOR_CATEGORY_LABELS } from '../../utils/events';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vendorId?: string | null;
}

export function BookingDialog({ event, open, onOpenChange, vendorId }: Props) {
  const db = useDb();
  const { pending, run } = useAsyncAction();
  const cats = db.budgetCategories.filter((c) => c.eventId === event.id);
  const [vid, setVid] = useState('');
  const [service_, setService] = useState('');
  const [agreed, setAgreed] = useState('');
  const [deposit, setDeposit] = useState('');
  const [depositDue, setDepositDue] = useState('');
  const [balanceDue, setBalanceDue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Extract<BookingStatus, 'requested' | 'confirmed'>>('requested');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vendor = db.vendors.find((v) => v.id === vid);

  useEffect(() => {
    if (!open) return;
    const v = db.vendors.find((x) => x.id === (vendorId ?? '')) ?? null;
    setVid(v?.id ?? '');
    const first = v?.services[0];
    setService(first?.name ?? '');
    setAgreed(first ? koboToInput(first.price) : '');
    setDeposit('');
    setDepositDue('');
    setBalanceDue('');
    const guess = v ? cats.find((c) => c.name.toLowerCase().includes(VENDOR_CATEGORY_LABELS[v.category].split(' ')[0].toLowerCase())) : undefined;
    setCategoryId(guess?.id ?? '');
    setNotes('');
    setStatus(v && !v.isMarketplace ? 'confirmed' : 'requested');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vendorId]);

  async function save() {
    const a = parseNairaInput(agreed);
    const d = deposit.trim() ? parseNairaInput(deposit) : 0;
    const e: Record<string, string> = {};
    if (!vid) e.vendor = 'Choose a vendor.';
    if (!service_.trim()) e.service = 'Describe the service.';
    if (!a) e.agreed = 'Enter the agreed or quoted amount.';
    if (d === null) e.deposit = 'Enter a valid amount.';else
    if (a && d > a) e.deposit = 'Deposit can’t exceed the agreed amount.';
    if (d && !depositDue) e.depositDue = 'When is the deposit due?';
    setErrors(e);
    if (Object.keys(e).length || !a) return;
    const ok = await run(
      () => service.requestBooking({
        eventId: event.id, vendorId: vid, categoryId: categoryId || null, serviceName: service_, agreedAmount: a, depositAmount: d ?? 0,
        depositDueDate: depositDue ? combineDateTime(depositDue, '17:00') : null, balanceDueDate: balanceDue ? combineDateTime(balanceDue, '17:00') : null, notes, status
      }),
      { success: status === 'requested' ? `Booking request sent to ${vendor?.name} (simulated)` : `${vendor?.name} booked` }
    );
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Book a vendor" description={`For ${event.title}`} submitLabel={status === 'requested' ? 'Send booking request' : 'Save confirmed booking'} pending={pending} onSubmit={save} wide>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Vendor" htmlFor="bk-vendor" error={errors.vendor}>
          <NativeSelect id="bk-vendor" value={vid} onChange={(e) => {setVid(e.target.value);const v = db.vendors.find((x) => x.id === e.target.value);if (v?.services[0]) {setService(v.services[0].name);setAgreed(koboToInput(v.services[0].price));}setStatus(v && !v.isMarketplace ? 'confirmed' : 'requested');}}>
            <option value="">Choose…</option>
            {db.vendors.map((v) => <option key={v.id} value={v.id}>{v.name}{v.isMarketplace ? '' : ' (your vendor)'}</option>)}
          </NativeSelect>
        </FormField>
        <FormField label="Service" htmlFor="bk-service" error={errors.service}>
          {vendor && vendor.services.length > 0 ?
          <NativeSelect id="bk-service" value={service_} onChange={(e) => {setService(e.target.value);const s = vendor.services.find((x) => x.name === e.target.value);if (s) setAgreed(koboToInput(s.price));}}>
              {vendor.services.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </NativeSelect> :

          <Input {...fieldA11y('bk-service', errors.service)} value={service_} onChange={(e) => setService(e.target.value)} placeholder="e.g. Canopies and 300 chairs" className={inputClass} />
          }
        </FormField>
        <FormField label="Agreed / quoted amount" htmlFor="bk-agreed" error={errors.agreed} hint="Per-guest prices: enter the total for your headcount.">
          <MoneyInput {...fieldA11y('bk-agreed', errors.agreed, 'x')} value={agreed} onChange={(e) => setAgreed(e.target.value)} />
        </FormField>
        <FormField label="Budget category" htmlFor="bk-cat" optional>
          <NativeSelect id="bk-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Uncategorised</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
        </FormField>
        <FormField label="Deposit" htmlFor="bk-deposit" optional error={errors.deposit}>
          <MoneyInput {...fieldA11y('bk-deposit', errors.deposit)} value={deposit} onChange={(e) => setDeposit(e.target.value)} />
        </FormField>
        <FormField label="Deposit due" htmlFor="bk-depdue" optional error={errors.depositDue}>
          <Input {...fieldA11y('bk-depdue', errors.depositDue)} type="date" value={depositDue} onChange={(e) => setDepositDue(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Balance due" htmlFor="bk-baldue" optional>
          <Input id="bk-baldue" type="date" value={balanceDue} onChange={(e) => setBalanceDue(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Status" htmlFor="bk-status" hint={status === 'requested' ? 'Not counted as committed until confirmed.' : 'Counts as committed spend immediately.'}>
          <NativeSelect id="bk-status" value={status} onChange={(e) => setStatus(e.target.value as 'requested' | 'confirmed')}>
            <option value="requested">Request — awaiting vendor confirmation</option>
            <option value="confirmed">Confirmed — terms already agreed</option>
          </NativeSelect>
        </FormField>
        <FormField label="Notes" htmlFor="bk-notes" optional className="sm:col-span-2">
          <Textarea id="bk-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl bg-white" />
        </FormField>
      </div>
    </FormDialog>);

}