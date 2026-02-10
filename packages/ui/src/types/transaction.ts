export enum TransactionStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  AWAITING_SIGNATURE = 'awaiting-signature',
  PENDING = 'pending',
  SUCCESS = 'success',
  REJECTED = 'rejected',
  FAILED = 'failed',
}

export interface TransactionState {
  status: TransactionStatus;
  txHash?: string;
  explorerUrl?: string;
}

export interface TransactionActions {
  startTransaction: () => void;
  signTransaction: () => Promise<string>;
  transactTransaction: (signature: string) => Promise<void>;
  resetTransaction: () => void;
}