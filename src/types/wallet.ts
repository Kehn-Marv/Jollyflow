import type { ISODateTime, Kobo } from './domain';

export interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  createdAt: ISODateTime;
}

export type TransferMode = 'send' | 'payout';

export interface WalletTxn {
  id: string;
  kind: 'account_created' | TransferMode;
  amount: Kobo;
  bankCode: string;
  accountNumber: string;
  narration: string;
  createdAt: ISODateTime;
}

export interface WalletState {
  account: VirtualAccount | null;
  balance: Kobo;
  pendingSales: Kobo;
  availableToWithdraw: Kobo;
  bonusBalance: Kobo;
  bonusYesterday: Kobo;
  history: WalletTxn[];
}

export interface TransferInput {
  mode: TransferMode;
  bankCode: string;
  accountNumber: string;
  amount: Kobo;
  narration: string;
}