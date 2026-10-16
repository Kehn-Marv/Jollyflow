import { useCallback, useEffect, useState } from 'react';
import type { TransferInput, WalletState, WalletTxn } from '../types/wallet';
import { formatNairaExact as formatNaira } from '../utils/money';

const EMPTY: WalletState = { account: null, balance: 0, pendingSales: 0, availableToWithdraw: 0, bonusBalance: 0, bonusYesterday: 0, history: [] };
const keyFor = (owner: string) => `jolliflow.wallet.${owner.toLowerCase()}`;
const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const txnId = () => `wtx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function read(owner: string): WalletState {
  try {
    const raw = localStorage.getItem(keyFor(owner));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return { ...EMPTY, ...parsed, history: Array.isArray(parsed.history) ? parsed.history : [] };
  } catch {
    return EMPTY;
  }
}

/**
 * Simulated ALAT wallet, stored per owner (an account or a single event).
 * In production the PIN is encrypted client-side and verified by the backend;
 * here it is only checked for format and never stored.
 */
export function useWallet(owner: string, accountName: string) {
  const [wallet, setWallet] = useState<WalletState>(() => read(owner));

  useEffect(() => setWallet(read(owner)), [owner]);

  const save = useCallback(
    (next: WalletState) => {
      try {
        localStorage.setItem(keyFor(owner), JSON.stringify(next));
      } catch {

        /* storage full or blocked — keep in memory */}
      setWallet(next);
    },
    [owner]
  );

  const generateAccount = useCallback(
    async (pin: string) => {
      if (!/^\d{4}$/.test(pin)) throw new Error('Enter your 4-digit PIN.');
      await wait(1800);
      const current = read(owner);
      if (current.account) return current.account;
      const accountNumber = `82${Math.floor(10_000_000 + Math.random() * 89_999_999)}`;
      const createdAt = new Date().toISOString();
      const entry: WalletTxn = { id: txnId(), kind: 'account_created', amount: 0, bankCode: '035', accountNumber, narration: 'ALAT account generated', createdAt };
      const next: WalletState = {
        ...current,
        account: { accountNumber, accountName: `JolliFlow / ${accountName}`, bankName: 'ALAT by Wema', createdAt },
        history: [entry, ...current.history]
      };
      save(next);
      return next.account!;
    },
    [owner, accountName, save]
  );

  const transfer = useCallback(
    async (input: TransferInput) => {
      await wait(900);
      const current = read(owner);
      const limit = input.mode === 'payout' ? current.availableToWithdraw : current.balance;
      if (input.amount > limit) {
        throw new Error(`Insufficient funds. ${input.mode === 'payout' ? 'Available to withdraw' : 'Your balance'} is ${formatNaira(limit)}.`);
      }
      const entry: WalletTxn = { id: txnId(), kind: input.mode, amount: input.amount, bankCode: input.bankCode, accountNumber: input.accountNumber, narration: input.narration, createdAt: new Date().toISOString() };
      const next: WalletState =
      input.mode === 'payout' ?
      { ...current, availableToWithdraw: current.availableToWithdraw - input.amount, history: [entry, ...current.history] } :
      { ...current, balance: current.balance - input.amount, history: [entry, ...current.history] };
      save(next);
    },
    [owner, save]
  );

  return { wallet, generateAccount, transfer };
}