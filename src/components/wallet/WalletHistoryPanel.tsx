import React from 'react';
import { ArrowDownLeft, ArrowUpRight, History, Landmark } from 'lucide-react';
import type { WalletTxn } from '../../types/wallet';
import { banks } from '../../data/banks';
import { formatNairaExact } from '../../utils/money';
import { fmtDateTime } from '../../utils/dates';
import { SidePanel } from '../ui/SidePanel';

interface WalletHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  history: WalletTxn[];
}

const KIND = {
  account_created: { label: 'Account generated', icon: Landmark },
  send: { label: 'Money sent', icon: ArrowUpRight },
  payout: { label: 'Payout', icon: ArrowDownLeft }
} as const;

export function WalletHistoryPanel({ open, onOpenChange, eventTitle, history }: WalletHistoryPanelProps) {
  return (
    <SidePanel open={open} onOpenChange={onOpenChange} title="Transaction history" description={`Party Bank · ${eventTitle}`}>
      {history.length ?
      <ul className="space-y-1.5 p-4">
          {history.map((t) => {
          const { label, icon: Icon } = KIND[t.kind];
          const bank = banks.find((b) => b.code === t.bankCode)?.name;
          return (
            <li key={t.id} className="flex items-start gap-3 rounded-2xl bg-paper px-4 py-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white"><Icon className="h-4 w-4 text-ink" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{t.narration || label}</span>
                  <span className="mt-0.5 block truncate text-xs text-smoke">
                    {t.kind === 'account_created' ? label : `${label} · ${bank ?? 'Bank'} ••${t.accountNumber.slice(-4)}`}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-smoke">{fmtDateTime(t.createdAt)}</span>
                </span>
                {t.kind !== 'account_created' && <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">−{formatNairaExact(t.amount)}</span>}
              </li>);

        })}
        </ul> :

      <div className="flex flex-col items-center px-6 py-20 text-center">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-sand"><History className="h-5 w-5 text-smoke" aria-hidden="true" /></span>
          <p className="mt-4 font-medium text-ink">No transactions yet</p>
          <p className="mt-1 max-w-xs text-sm text-smoke">Money received into and sent from this event’s Party Bank will show here.</p>
        </div>
      }
      <p className="px-6 pb-6 text-[11px] text-smoke/80">Simulated — no real money moves in this prototype.</p>
    </SidePanel>);

}