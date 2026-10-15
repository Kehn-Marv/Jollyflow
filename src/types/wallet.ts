import type { ISODateTime, Kobo } from './domain';

/** Virtual account issued for receiving money. Simulated in the prototype. */
export interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  createdAt: ISODateTime;
}

export interface WalletState {
  account: VirtualAccount | null;
  /** Spendable wallet balance, in kobo */
  balance: Kobo;
  /** Ticket / contribution sales not yet settled, in kobo */
  pendingSales: Kobo;
  /** Settled funds that can be paid out, in kobo */
  availableToWithdraw: Kobo;
}

export type TransferMode = 'send' | 'payout';

export interface TransferInput {
  mode: TransferMode;
  bankCode: string;
  accountNumber: string;
  amount: Kobo;
  narration: string;
}