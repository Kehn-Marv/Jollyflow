import { useCallback, useEffect, useState } from 'react';
import type { TransferInput, WalletState } from '../types/wallet';
import { formatNairaExact as formatNaira } from '../utils/money';

const EMPTY: WalletState = { account: null, balance: 0, pendingSales: 0, availableToWithdraw: 0 };
const keyFor = (owner: string) => `jolliflow.wallet.${owner.toLowerCase()}`;
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

function read(owner: string): WalletState {
  try {
    const raw = localStorage.getItem(keyFor(owner));
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as WalletState) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Simulated ALAT wallet. In production the PIN is encrypted client-side and
 * verified by the backend; here it is only checked for format and never stored.
 */
export function useWallet(owner: string, accountName: string) {
  const [wallet, setWallet] = useState<WalletState>(() => read(owner));

  useEffect(() => setWallet(read(owner)), [owner]);

  const save = useCallback(
    (next: WalletState) => {
      localStorage.setItem(keyFor(owner), JSON.stringify(next));
      setWallet(next);
    },
    [owner]
  );

  const generateAccount = useCallback(
    async (pin: string) => {
      if (!/^\d{4}$/.test(pin)) throw new Error('Enter your 4-digit PIN.');
      await wait(1800);
      const accountNumber = `82${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
      const next: WalletState = {
        ...wallet,
        account: { accountNumber, accountName: `JolliFlow / ${accountName}`, bankName: 'ALAT by Wema', createdAt: new Date().toISOString() }
      };
      save(next);
      return next.account!;
    },
    [wallet, accountName, save]
  );

  const transfer = useCallback(
    async (input: TransferInput) => {
      await wait(900);
      const limit = input.mode === 'payout' ? wallet.availableToWithdraw : wallet.balance;
      if (input.amount > limit) {
        throw new Error(`Insufficient funds. ${input.mode === 'payout' ? 'Available to withdraw' : 'Your balance'} is ${formatNaira(limit)}.`);
      }
      const next: WalletState =
      input.mode === 'payout' ?
      { ...wallet, availableToWithdraw: wallet.availableToWithdraw - input.amount } :
      { ...wallet, balance: wallet.balance - input.amount };
      save(next);
    },
    [wallet, save]
  );

  return { wallet, generateAccount, transfer };
}