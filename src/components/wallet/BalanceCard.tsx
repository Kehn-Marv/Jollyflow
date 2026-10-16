import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Kobo } from '../../types/domain';
import { formatNairaExact } from '../../utils/money';
import { OverflowMenu, type OverflowMenuItem } from '../ui/OverflowMenu';
import { cx } from '../../utils/styles';

interface BalanceCardProps {
  title: string;
  balance: Kobo;
  hidden: boolean;
  onToggleHidden: () => void;
  menu: OverflowMenuItem[];
  /** Small badge next to the title, e.g. “ALAT by Wema” */
  badge?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Shared shell for the Party Bank and Party Bonus wallet cards. */
export function BalanceCard({ title, balance, hidden, onToggleHidden, menu, badge, children, footer, className }: BalanceCardProps) {
  return (
    <section aria-label={title} className={cx('flex flex-col overflow-hidden rounded-3xl border border-line bg-white', className)}>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate font-display text-[15px] font-semibold text-ink">{title}</h2>
            {badge}
          </div>
          <OverflowMenu label={`${title} options`} items={menu} />
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-ink sm:text-[2rem]" aria-live="polite">
            {hidden ? <span aria-label="Balance hidden">₦ ••••••</span> : formatNairaExact(balance)}
          </p>
          <button
            type="button"
            onClick={onToggleHidden}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            aria-pressed={hidden}
            className="grid h-8 w-8 place-items-center rounded-full text-smoke transition hover:bg-paper hover:text-ink">
            
            {hidden ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {children}
      </div>
      {footer}
    </section>);

}