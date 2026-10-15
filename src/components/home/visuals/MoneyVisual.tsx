import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useDb } from '../../../contexts/DataContext';
import { summariseEvent } from '../../../utils/finance';
import { formatNaira } from '../../../utils/money';
import { BudgetMeter } from '../../money/BudgetMeter';
import { PAYMENT_LABEL, PAYMENT_TONE, StatusPill } from '../../ui/StatusPill';

export function MoneyVisual({ eventId = 'e_wedding' }: {eventId?: string;}) {
  const db = useDb();
  const fin = summariseEvent(db, eventId);
  const txns = db.transactions.filter((t) => t.eventId === eventId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <div className="rounded-[1.6rem] border-2 border-ink bg-white p-5 shadow-pop-lg">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-lg font-semibold text-ink">Budget</p>
        <p className="font-display text-2xl font-bold tabular-nums text-ink">{formatNaira(fin.budget)}</p>
      </div>
      <BudgetMeter summary={fin} className="mt-4" />
      <div className="mt-5 rounded-2xl bg-paper p-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-smoke">Latest money movements · simulated</p>
        <ul className="mt-2 space-y-1">
          {txns.map((t) =>
          <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
              {t.direction === 'in' ? <ArrowDownLeft className="h-4 w-4 shrink-0 text-forest" aria-label="Incoming" /> : <ArrowUpRight className="h-4 w-4 shrink-0 text-coral" aria-label="Outgoing" />}
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{t.counterparty}</span>
              <span className="text-sm font-semibold tabular-nums text-ink">{formatNaira(t.amount)}</span>
              <StatusPill tone={PAYMENT_TONE[t.status]}>{PAYMENT_LABEL[t.status]}</StatusPill>
            </li>
          )}
        </ul>
      </div>
    </div>);

}