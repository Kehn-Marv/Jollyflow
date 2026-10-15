import React, { useEffect, useState } from 'react';
import type { BudgetItem, BudgetItemStatus, EventRecord } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { useDb } from '../../contexts/DataContext';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { koboToInput, parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  item: BudgetItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function BudgetItemDialog({ event, item, open, onOpenChange }: Props) {
  const db = useDb();
  const cats = db.budgetCategories.filter((c) => c.eventId === event.id);
  const { pending, run } = useAsyncAction();
  const [label, setLabel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [newCat, setNewCat] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<BudgetItemStatus>('estimate');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setLabel(item?.label ?? '');
    setCategoryId(item?.categoryId ?? cats[0]?.id ?? '__new');
    setNewCat('');
    setAmount(item ? koboToInput(item.amount) : '');
    setStatus(item?.status ?? 'estimate');
    setNote(item?.note ?? '');
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  async function save() {
    const kobo = parseNairaInput(amount);
    const e: Record<string, string> = {};
    if (label.trim().length < 2) e.label = 'Describe the cost.';
    if (!kobo) e.amount = 'Enter an amount greater than zero.';
    if (categoryId === '__new' && newCat.trim().length < 2) e.category = 'Name the new category.';
    setErrors(e);
    if (Object.keys(e).length || !kobo) return;
    const ok = await run(async () => {
      let cid = categoryId;
      if (cid === '__new') cid = (await service.addBudgetCategory({ eventId: event.id, name: newCat, planned: 0 })).id;
      const input = { eventId: event.id, categoryId: cid, label, amount: kobo, status, note };
      return item ? service.updateBudgetItem(item.id, input) : service.addBudgetItem(input);
    }, { success: item ? 'Budget item updated' : 'Budget item added' });
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={item ? 'Edit budget item' : 'Add a budget item'} description="Estimates are plans. Committed means you’ve agreed to pay it." submitLabel={item ? 'Save item' : 'Add item'} pending={pending} onSubmit={save}>
      <FormField label="Item" htmlFor="bi-label" error={errors.label}>
        <Input {...fieldA11y('bi-label', errors.label)} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Souvenirs for 300 guests" className={inputClass} autoFocus />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Category" htmlFor="bi-cat" error={errors.category}>
          <NativeSelect id="bi-cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__new">+ New category</option>
          </NativeSelect>
        </FormField>
        {categoryId === '__new' &&
        <FormField label="New category name" htmlFor="bi-newcat">
            <Input id="bi-newcat" value={newCat} onChange={(e) => setNewCat(e.target.value)} className={inputClass} />
          </FormField>
        }
        <FormField label="Amount" htmlFor="bi-amount" error={errors.amount}>
          <MoneyInput {...fieldA11y('bi-amount', errors.amount)} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </FormField>
        <FormField label="Status" htmlFor="bi-status">
          <NativeSelect id="bi-status" value={status} onChange={(e) => setStatus(e.target.value as BudgetItemStatus)}>
            <option value="estimate">Estimate — planned only</option>
            <option value="committed">Committed — agreed to pay</option>
          </NativeSelect>
        </FormField>
      </div>
      <FormField label="Note" htmlFor="bi-note" optional>
        <Input id="bi-note" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
      </FormField>
    </FormDialog>);

}