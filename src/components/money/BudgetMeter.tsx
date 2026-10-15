import React from 'react';
import type { FinanceSummary } from '../../utils/finance';
import { formatNaira } from '../../utils/money';
import { cx } from '../../utils/styles';

interface BudgetMeterProps {
  summary: Pick<FinanceSummary, 'budget' | 'committed' | 'paid' | 'pendingOut'>;
  tone?: 'light' | 'dark';
  className?: string;
}

/** Stacked bar: paid ⊂ committed ⊂ budget. Pending is never shown as paid. */
export function BudgetMeter({ summary, tone = 'light', className }: BudgetMeterProps) {
  const { budget, committed, paid, pendingOut } = summary;
  const scale = Math.max(budget, committed, 1);
  const paidPct = Math.min(paid, committed || paid) / scale * 100;
  const unpaidPct = Math.max(0, committed - paid) / scale * 100;
  const over = committed > budget && budget > 0;
  const remaining = budget - committed;
  const dark = tone === 'dark';

  const rows = [
  { key: 'paid', label: 'Paid (confirmed)', value: paid, swatch: dark ? 'bg-lime' : 'bg-ink' },
  { key: 'committed', label: 'Committed, not yet paid', value: Math.max(0, committed - paid), swatch: 'bg-coral' },
  { key: 'remaining', label: over ? 'Over budget' : 'Remaining budget', value: Math.abs(remaining), swatch: over ? 'bg-danger' : dark ? 'bg-white/20' : 'bg-sand border border-line' }];


  return (
    <div className={className}>
      <div
        className={cx('relative flex h-4 w-full overflow-hidden rounded-full', dark ? 'bg-white/15' : 'bg-sand')}
        role="img"
        aria-label={`${formatNaira(paid)} paid and ${formatNaira(Math.max(0, committed - paid))} committed but unpaid, out of a ${formatNaira(budget)} budget.`}>
        
        <div className={cx('h-full transition-[width] duration-500', dark ? 'bg-lime' : 'bg-ink')} style={{ width: `${paidPct}%` }} />
        <div className="h-full bg-coral transition-[width] duration-500" style={{ width: `${unpaidPct}%` }} />
        {over && <div className="absolute inset-y-0 w-0.5 bg-danger" style={{ left: `${budget / scale * 100}%` }} />}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map((r) =>
        <li key={r.key} className="flex items-center justify-between gap-3">
            <span className={cx('flex items-center gap-2', dark ? 'text-paper/75' : 'text-smoke')}>
              <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', r.swatch)} aria-hidden="true" />
              {r.label}
            </span>
            <span className={cx('font-semibold tabular-nums', over && r.key === 'remaining' ? 'text-danger' : dark ? 'text-paper' : 'text-ink')}>
              {over && r.key === 'remaining' ? '−' : ''}
              {formatNaira(r.value)}
            </span>
          </li>
        )}
        {pendingOut > 0 &&
        <li className={cx('flex items-center justify-between gap-3 border-t pt-1.5 text-xs', dark ? 'border-white/10 text-paper/60' : 'border-line text-smoke')}>
            <span>Pending payments (not counted as paid)</span>
            <span className="font-semibold tabular-nums">{formatNaira(pendingOut)}</span>
          </li>
        }
      </ul>
    </div>);

}