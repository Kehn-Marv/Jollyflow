import React from 'react';
import { Gift, PackageCheck } from 'lucide-react';
import { useDb } from '../../../contexts/DataContext';
import { giftRaised } from '../../../utils/finance';
import { formatNaira, percent } from '../../../utils/money';
import { ProgressBar } from '../../ui/ProgressBar';

export function GiftVisual({ fundId = 'gi_b_obudu', itemId = 'gi_b_cam' }: {fundId?: string;itemId?: string;}) {
  const db = useDb();
  const fund = db.giftItems.find((g) => g.id === fundId);
  const item = db.giftItems.find((g) => g.id === itemId);
  if (!fund) return null;
  const r = giftRaised(db, fund.id);

  return (
    <div className="relative">
      <div className="rounded-[1.6rem] border-2 border-ink bg-white p-5 shadow-pop-lg">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-lime"><Gift className="h-5 w-5" aria-hidden="true" /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-smoke">Cash fund</p>
            <p className="truncate font-display text-lg font-semibold text-ink">{fund.name}</p>
          </div>
        </div>
        <p className="mt-5 font-display text-4xl font-bold tabular-nums text-ink">{formatNaira(r.raised)}</p>
        <p className="text-sm text-smoke">raised of {formatNaira(fund.targetAmount ?? 0)} · {r.contributors} contributors</p>
        <ProgressBar value={r.raised} max={fund.targetAmount ?? 1} label="Fund progress" tone="ink" className="mt-4" />
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-ink">{percent(r.raised, fund.targetAmount ?? 1)}% funded</span>
          {r.pending > 0 && <span className="rounded-full bg-[#FFE7DF] px-2 py-0.5 font-semibold text-[#9C3418]">{formatNaira(r.pending)} pending — not counted</span>}
        </div>
      </div>
      {item &&
      <div className="relative -mt-4 ml-6 rotate-[-2deg] rounded-2xl border-2 border-ink bg-sky p-4 shadow-pop sm:ml-16">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
              <p className="text-xs text-ink/75">Reserved by {item.reservedBy} · reserved ≠ received</p>
            </div>
          </div>
        </div>
      }
    </div>);

}