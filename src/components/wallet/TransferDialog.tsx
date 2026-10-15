import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { TransferInput, TransferMode } from '../../types/wallet';
import type { Kobo } from '../../types/domain';
import { banks } from '../../data/banks';
import { FormDialog } from '../ui/FormDialog';
import { FormField, MoneyInput, NativeSelect, fieldA11y } from '../ui/FormField';
import { Input } from '../ui/Input';
import { formatNairaExact as formatNaira, parseNairaInput } from '../../utils/money';
import { inputClass } from '../../utils/styles';

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TransferMode;
  limit: Kobo;
  onSubmit: (input: TransferInput) => Promise<void>;
}

export function TransferDialog({ open, onOpenChange, mode, limit, onSubmit }: TransferDialogProps) {
  const [bankCode, setBankCode] = useState(banks[0].code);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const payout = mode === 'payout';

  useEffect(() => {
    if (!open) return;
    setBankCode(banks[0].code);
    setAccountNumber('');
    setAmount('');
    setNarration('');
    setErrors({});
    setPending(false);
    setDone(false);
  }, [open]);

  async function submit() {
    if (done) return onOpenChange(false);
    const kobo = parseNairaInput(amount);
    const e: Record<string, string> = {};
    if (!/^\d{10}$/.test(accountNumber)) e.account = 'Enter a 10-digit account number.';
    if (!kobo) e.amount = 'Enter an amount greater than zero.';else
    if (kobo > limit) e.amount = `Insufficient funds. ${payout ? 'Available to withdraw' : 'Your balance'} is ${formatNaira(limit)}.`;
    setErrors(e);
    if (Object.keys(e).length || !kobo) return;
    setPending(true);
    try {
      await onSubmit({ mode, bankCode, accountNumber, amount: kobo, narration });
      setDone(true);
    } catch (err) {
      setErrors({ amount: err instanceof Error ? err.message : 'Transfer failed.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={payout ? 'Payout' : 'Send money'}
      description={payout ? `Withdraw settled funds to your bank. Available: ${formatNaira(limit)}` : `Transfer from your wallet. Balance: ${formatNaira(limit)}`}
      submitLabel={done ? 'Done' : pending ? 'Sending…' : payout ? 'Request payout' : 'Send money'}
      pending={pending}
      onSubmit={submit}>
      
      {done ?
      <div className="flex flex-col items-center py-6 text-center" role="status">
          <CheckCircle2 className="h-10 w-10 text-forest" aria-hidden="true" />
          <p className="mt-3 font-semibold text-ink">{payout ? 'Payout requested' : 'Transfer sent'}</p>
          <p className="mt-1 text-sm text-smoke">Simulated in this prototype — no money moved.</p>
        </div> :

      <>
          <FormField label="Bank" htmlFor="tr-bank">
            <NativeSelect id="tr-bank" value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
              {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
            </NativeSelect>
          </FormField>
          <FormField label="Account number" htmlFor="tr-acct" error={errors.account}>
            <Input {...fieldA11y('tr-acct', errors.account)} inputMode="numeric" maxLength={10} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} placeholder="0123456789" className={inputClass} />
          </FormField>
          <FormField label="Amount" htmlFor="tr-amount" error={errors.amount}>
            <MoneyInput {...fieldA11y('tr-amount', errors.amount)} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </FormField>
          <FormField label="Narration" htmlFor="tr-note" optional>
            <Input id="tr-note" value={narration} onChange={(e) => setNarration(e.target.value)} maxLength={60} placeholder={payout ? 'Event payout' : 'What’s this for?'} className={inputClass} />
          </FormField>
        </>
      }
    </FormDialog>);

}