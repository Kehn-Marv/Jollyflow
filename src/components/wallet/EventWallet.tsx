import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Copy, History, Info, Landmark, Send } from 'lucide-react';
import type { EventRecord } from '../../types/domain';
import type { TransferInput, TransferMode } from '../../types/wallet';
import { useWallet } from '../../hooks/useWallet';
import { copyText } from '../../utils/clipboard';
import { formatNairaExact } from '../../utils/money';
import { BalanceCard } from './BalanceCard';
import { PinDialog } from './PinDialog';
import { TransferDialog } from './TransferDialog';
import { WalletHistoryPanel } from './WalletHistoryPanel';
import { Button } from '../ui/Button';
import { btn, cx } from '../../utils/styles';

type PinIntent = 'generate' | 'transfer' | null;
interface PendingTransfer {
  input: TransferInput;
  resolve: () => void;
  reject: (err: Error) => void;
}

/** “3152 4403 88” — easier to read aloud and verify. */
const groupAccount = (n: string) => `${n.slice(0, 4)} ${n.slice(4, 8)} ${n.slice(8)}`;

export function EventWallet({ event }: {event: EventRecord;}) {
  const { wallet, generateAccount, transfer } = useWallet(`event:${event.id}`, event.title);
  const [hideBank, setHideBank] = useState(false);
  const [hideBonus, setHideBonus] = useState(false);
  const [pinIntent, setPinIntent] = useState<PinIntent>(null);
  const [transferMode, setTransferMode] = useState<TransferMode | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const pendingTransfer = useRef<PendingTransfer | null>(null);
  const account = wallet.account;

  async function copyAccount() {
    if (!account) return;
    const ok = await copyText(account.accountNumber);
    ok ? toast.success('Account number copied') : toast.error('Couldn’t copy — select the number instead.');
  }

  /** Every transfer is authorised with the PIN before it runs. */
  function requestTransfer(input: TransferInput) {
    return new Promise<void>((resolve, reject) => {
      pendingTransfer.current = { input, resolve, reject };
      setPinIntent('transfer');
    });
  }

  function closePin() {
    if (pinIntent === 'transfer' && pendingTransfer.current) {
      pendingTransfer.current.reject(new Error('Transfer not sent — enter your PIN to authorise it.'));
      pendingTransfer.current = null;
    }
    setPinIntent(null);
  }

  async function confirmPin(pin: string) {
    if (pinIntent === 'generate') {
      await generateAccount(pin);
      setPinIntent(null);
      toast.success('ALAT account generated', { description: 'Share it with guests to receive money for this event.' });
      return;
    }
    const pending = pendingTransfer.current;
    if (!pending) return setPinIntent(null);
    if (!/^\d{4}$/.test(pin)) throw new Error('Enter your 4-digit PIN.');
    pendingTransfer.current = null;
    setPinIntent(null);
    try {
      await transfer(pending.input);
      pending.resolve();
    } catch (err) {
      pending.reject(err instanceof Error ? err : new Error('Transfer failed.'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Party Bank */}
        <BalanceCard
          title="Party Bank"
          badge={<span className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-smoke">ALAT</span>}
          balance={wallet.balance}
          hidden={hideBank}
          onToggleHidden={() => setHideBank((h) => !h)}
          menu={[
          { label: 'Copy account number', icon: Copy, onSelect: copyAccount, disabled: !account },
          { label: 'View history', icon: History, onSelect: () => setHistoryOpen(true) },
          { label: account ? 'Account generated' : 'Generate bank account', icon: Landmark, onSelect: () => setPinIntent('generate'), disabled: !!account }]
          }>
          
          <div className="mt-3 min-h-[2.25rem]">
            {account ?
            <button
              type="button"
              onClick={copyAccount}
              aria-label={`Copy account number ${account.accountNumber}`}
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-3.5 pr-2.5 text-sm transition hover:border-ink/30">
              
                <span className="font-mono font-medium tabular-nums tracking-wide text-ink">{groupAccount(account.accountNumber)}</span>
                <span className="text-smoke">· ALAT</span>
                <Copy className="h-3.5 w-3.5 text-smoke transition group-hover:text-ink" aria-hidden="true" />
              </button> :

            <Button type="button" onClick={() => setPinIntent('generate')} className={cx(btn.base, btn.lime, btn.sm)}>
                <Landmark className="h-4 w-4" aria-hidden="true" /> Generate Bank Account
              </Button>
            }
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
            <Button
              type="button"
              disabled={!account}
              title={account ? undefined : 'Generate a bank account first'}
              onClick={() => setTransferMode('send')}
              className={cx(btn.base, btn.ink, btn.md, 'w-full')}>
              
              <Send className="h-4 w-4" aria-hidden="true" /> Send Money
            </Button>
            <Button type="button" onClick={() => setHistoryOpen(true)} className={cx(btn.base, btn.outline, btn.md, 'w-full')}>
              <History className="h-4 w-4" aria-hidden="true" /> View History
            </Button>
          </div>
          {!account && <p className="mt-2 text-xs text-smoke">Generate an account to send and receive money for this event.</p>}
        </BalanceCard>

        {/* Party Bonus Wallet */}
        <BalanceCard
          title="Party Bonus Wallet"
          balance={wallet.bonusBalance}
          hidden={hideBonus}
          onToggleHidden={() => setHideBonus((h) => !h)}
          menu={[
          { label: 'How bonuses work', icon: Info, onSelect: () => toast('Party Bonus', { description: 'Bonuses build up from activity in this event’s Party Bank and are paid out monthly.' }) },
          { label: hideBonus ? 'Show balance' : 'Hide balance', onSelect: () => setHideBonus((h) => !h) }]
          }
          footer={<p className="border-t border-line bg-paper px-5 py-3 text-xs font-medium text-smoke sm:px-6">To be paid next month</p>}>
          
          <span className="mt-3 inline-flex w-fit items-center rounded-full bg-lime/60 px-3 py-1 text-xs font-medium text-ink">
            Bonus Yesterday: {hideBonus ? '₦ ••••' : formatNairaExact(wallet.bonusYesterday)}
          </span>
        </BalanceCard>
      </div>

      {/* ALAT Settlements */}
      <section aria-labelledby={`settle-${event.id}`} className="rounded-3xl border border-line bg-white p-5 sm:p-6">
        <h2 id={`settle-${event.id}`} className="font-display text-[15px] font-semibold text-ink">ALAT Settlements</h2>
        <div className="mt-4 grid grid-cols-2 items-end gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-smoke">Pending Sales</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">{formatNairaExact(wallet.pendingSales)}</p>
          </div>
          <div className="sm:text-center">
            <p className="text-xs text-smoke">Available to withdraw</p>
            <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">{formatNairaExact(wallet.availableToWithdraw)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 sm:text-right">
            <Button
              type="button"
              disabled={!account}
              title={account ? undefined : 'Generate a bank account first'}
              onClick={() => setTransferMode('payout')}
              className={cx(btn.base, btn.ink, btn.md, 'w-full sm:w-auto')}>
              
              Payout
            </Button>
          </div>
        </div>
      </section>

      <PinDialog
        open={pinIntent !== null}
        onOpenChange={(o) => !o && closePin()}
        onConfirm={confirmPin}
        {...pinIntent === 'transfer' ?
        { title: 'Enter PIN to authorise', submitLabel: 'Authorise transfer', pendingLabel: 'Sending…', pendingHint: 'Authorising your transfer' } :
        {}} />
      
      {transferMode &&
      <TransferDialog
        open
        onOpenChange={(o) => !o && setTransferMode(null)}
        mode={transferMode}
        limit={transferMode === 'payout' ? wallet.availableToWithdraw : wallet.balance}
        onSubmit={requestTransfer} />

      }
      <WalletHistoryPanel open={historyOpen} onOpenChange={setHistoryOpen} eventTitle={event.title} history={wallet.history} />
    </div>);

}