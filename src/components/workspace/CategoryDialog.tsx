import React, { useEffect, useState } from 'react';
import type { BudgetCategory, EventRecord } from '../../types/domain';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { service } from '../../services';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { koboToInput, parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

interface Props {
  event: EventRecord;
  category: BudgetCategory | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function CategoryDialog({ event, category, open, onOpenChange }: Props) {
  const { pending, run } = useAsyncAction();
  const [name, setName] = useState('');
  const [planned, setPlanned] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setPlanned(category ? koboToInput(category.planned) : '');
    setErrors({});
  }, [open, category]);

  async function save() {
    const kobo = parseNairaInput(planned || '0');
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Name the category.';
    if (kobo === null) e.planned = 'Enter a valid amount.';
    setErrors(e);
    if (Object.keys(e).length || kobo === null) return;
    const ok = await run(
      () => category ? service.updateBudgetCategory(category.id, { name: name.trim(), planned: kobo }) : service.addBudgetCategory({ eventId: event.id, name, planned: kobo }),
      { success: category ? 'Category updated' : 'Category added' }
    );
    if (ok) onOpenChange(false);
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={category ? 'Edit category' : 'Add a budget category'} submitLabel="Save" pending={pending} onSubmit={save}>
      <FormField label="Name" htmlFor="cat-name" error={errors.name}>
        <Input {...fieldA11y('cat-name', errors.name)} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoFocus />
      </FormField>
      <FormField label="Planned allocation" htmlFor="cat-planned" error={errors.planned} hint="How much of the budget you intend to spend here.">
        <MoneyInput {...fieldA11y('cat-planned', errors.planned, 'x')} value={planned} onChange={(e) => setPlanned(e.target.value)} />
      </FormField>
    </FormDialog>);

}