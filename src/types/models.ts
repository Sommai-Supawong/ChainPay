export type WalletModel = {
  id: string;
  address: `0x${string}`;
  label: string;
  isPrimary: boolean;
  verifiedAt: string;
};
export type ContactModel = {
  id: string;
  name: string;
  walletAddress: string;
  label: string;
};
export type RequestModel = {
  id: string;
  slug: string;
  title: string;
  description: string;
  amount: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
};
export type TransactionModel = {
  id: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  status: string;
  title: string;
  direction: string;
  submittedAt: string;
};
export type IntentModel = {
  id: string;
  token: string;
  paymentId: `0x${string}`;
  fromAddress: `0x${string}`;
  toAddress: `0x${string}`;
  amount: string;
  title: string;
  expiresAt: string;
  contract: `0x${string}`;
  chainId: number;
};
export type ReceiptModel = {
  txHash: string;
  status: string;
  amount: string;
  asset: string;
  fromAddress: string;
  toAddress: string;
  blockNumber: string | null;
  confirmedAt: string | null;
  submittedAt: string;
  title: string;
  note: string | null;
};
