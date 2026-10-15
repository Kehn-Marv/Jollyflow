import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { StepProps } from '../../types/wizard';
import { FormField, MoneyInput, fieldA11y } from '../ui/FormField';
import { formatNaira, parseNairaInput, sumKobo } from '../../utils/money';
import { cx, inputClass } from '../../utils/styles';

export function StepBudget({ draft, update, errors }: StepProps) {
  const budget = parseNairaInput(draft.budget) ?? 0;
  const planned = sumKobo(draft.categories.filter((c) => c.enabled).map((c) => parseNairaInput(c.planned) ?? 0));
  const setCat = (id: string, patch: Partial<StepProps['draft']['categories'][number]>) =>
  update({ categories: draft.categories.map((c) => c.id === id ? { ...c, ...patch } : c) });

  return (
    <div>
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">Plan the money</h2>
      <p className="mt-1 text-smoke">Set a total and rough allocations. These are plans, not payments — you can refine them anytime.</p>
      <FormField label="Total budget" htmlFor="budget" optional error={errors.budget} className="mt-6 max-w-sm">
        <MoneyInput {...fieldA11y('budget', errors.budget)} value={draft.budget} onChange={(e) => update({ budget: e.target.value })} placeholder="0" />
      </FormField>

      <fieldset className="mt-8" aria-describedby={errors.categories ? 'categories-error' : undefined}>
        <legend className="text-sm font-medium text-ink">Starter categories</legend>
        <ul className="mt-3 space-y-2">
          {draft.categories.map((c) =>
          <li key={c.id} className={cx('flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-2 sm:flex-nowrap', c.enabled ? 'border-line' : 'border-dashed border-line opacity-60')}>
              <input type="checkbox" checked={c.enabled} onChange={(e) => setCat(c.id, { enabled: e.target.checked })} aria-label={`Include ${c.name || 'category'}`} className="ml-2 h-5 w-5 accent-ink" />
              <input value={c.name} onChange={(e) => setCat(c.id, { name: e.target.value })} aria-label="Category name" className={cx(inputClass, 'h-10 min-w-0 flex-1 border-transparent bg-transparent')} />
              <div className="w-full sm:w-44">
                <MoneyInput value={c.planned} onChange={(e) => setCat(c.id, { planned: e.target.value })} aria-label={`Planned amount for ${c.name}`} className="h-10" />
              </div>
              <button type="button" onClick={() => update({ categories: draft.categories.filter((x) => x.id !== c.id) })} aria-label={`Remove ${c.name}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-smoke hover:bg-sand hover:text-danger">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          )}
        </ul>
        <button type="button" onClick={() => update({ categories: [...draft.categories, { id: `cat_${Date.now()}`, name: '', planned: '', enabled: true }] })} className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-sand">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add category
        </button>
        {errors.categories && <p id="categories-error" role="alert" className="mt-2 text-sm font-medium text-danger">{errors.categories}</p>}
      </fieldset>

      <div className={cx('mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl p-4 text-sm', budget && planned > budget ? 'bg-[#FFE7DF] text-[#9C3418]' : 'bg-sand text-ink')} role="status">
        <span>Allocated <strong className="tabular-nums">{formatNaira(planned)}</strong> of <strong className="tabular-nums">{formatNaira(budget)}</strong></span>
        {budget > 0 && planned > budget && <span className="font-semibold">Allocations exceed the total by {formatNaira(planned - budget)}</span>}
      </div>
    </div>);

}