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
  onTransactionStatusChangeToPreparing: () => void;
  onTransactionStatusChangeToPending: (hash: string) => void;
  onTransactionStatusChangeToSuccess: () => void;
  onTransactionStatusChangeToFailed: () => void;
}