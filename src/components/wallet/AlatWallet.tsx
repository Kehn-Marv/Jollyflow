import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Landmark, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { TransferMode } from '../../types/wallet';
import { useWallet } from '../../hooks/useWallet';
import { formatNairaExact as formatNaira } from '../../utils/money';
import { PinDialog } from './PinDialog';
import { TransferDialog } from './TransferDialog';
import { CopyButton } from '../ui/CopyButton';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

interface AlatWalletProps {
  owner: string;
  accountName: string;
}

export function AlatWallet({ owner, accountName }: AlatWalletProps) {
  const { wallet, generateAccount, transfer } = useWallet(owner, accountName);
  const [pinOpen, setPinOpen] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode | null>(null);
  const acct = wallet.account;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      {/* Wallet card */}
      <section aria-labelledby="wallet-title" className="on-dark flex flex-col justify-between rounded-3xl bg-ink p-6 text-paper sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id="wallet-title" className="text-sm font-medium text-paper/60">Wallet balance</h3>
            <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">{formatNaira(wallet.balance)}</p>
          </div>
          <span className="rounded-full border border-paper/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-paper/70">ALAT</span>
        </div>

        {acct ?
        <div className="mt-8 rounded-2xl bg-white/[0.06] p-4">
            <p className="text-xs text-paper/55">Receive money · {acct.bankName}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-xl font-semibold tracking-wider">{acct.accountNumber}</p>
              <CopyButton value={acct.accountNumber} label="Copy" copiedMessage="Account number copied" variant="onDark" />
            </div>
            <p className="mt-1 truncate text-xs text-paper/55">{acct.accountName}</p>
          </div> :

        <div className="mt-8">
            <p className="text-sm text-paper/60">Generate a virtual bank account to receive ticket sales, gifts and contributions.</p>
            <Button type="button" onClick={() => setPinOpen(true)} className={cx(btn.base, btn.lime, btn.md, 'mt-4')}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Generate Bank Account
            </Button>
          </div>
        }

        <div className="mt-6 flex flex-wrap gap-2 border-t border-paper/10 pt-5">
          <Button type="button" disabled={!acct} onClick={() => setTransferMode('send')} className={cx(btn.base, btn.onDark, btn.sm)}>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> Send money
          </Button>
          {!acct && <p className="self-center text-xs text-paper/45">Generate an account to send money.</p>}
        </div>
      </section>

      {/* Settlements */}
      <section aria-labelledby="settle-title" className="flex flex-col rounded-3xl border border-line bg-white p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-smoke" aria-hidden="true" />
          <h3 id="settle-title" className="font-display text-lg font-semibold text-ink">ALAT Settlements</h3>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-smoke">Pending Sales</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{formatNaira(wallet.pendingSales)}</dd>
          </div>
          <div>
            <dt className="text-xs text-smoke">Available to withdraw</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{formatNaira(wallet.availableToWithdraw)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-smoke">Sales settle into “Available to withdraw” once confirmed. Payouts go to any Nigerian bank account.</p>
        <Button type="button" onClick={() => setTransferMode('payout')} className={cx(btn.base, btn.ink, btn.md, 'mt-auto self-start')}>
          <ArrowDownToLine className="h-4 w-4" aria-hidden="true" /> Payout
        </Button>
      </section>

      <p className="text-xs text-smoke lg:col-span-2">Prototype: account generation and transfers are simulated and stored only in this browser. Not affiliated with or endorsed by Wema Bank.</p>

      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onConfirm={async (pin) => {
          const a = await generateAccount(pin);
          setPinOpen(false);
          toast.success(`Account ${a.accountNumber} is ready to receive money`);
        }} />
      
      <TransferDialog
        open={transferMode !== null}
        onOpenChange={(o) => !o && setTransferMode(null)}
        mode={transferMode ?? 'send'}
        limit={transferMode === 'payout' ? wallet.availableToWithdraw : wallet.balance}
        onSubmit={transfer} />
      
    </div>);

}