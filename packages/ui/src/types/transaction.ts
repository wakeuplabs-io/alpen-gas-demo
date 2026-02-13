export enum TransactionStatus {
  IDLE = 'idle',
  PREPARING = 'preparing',
  DELEGATING = 'delegating',
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
  startTransaction: () => Promise<void>;
  signTransaction: () => Promise<string>;
  transactTransaction: (signature: string) => Promise<void>;
  resetTransaction: () => void;
}