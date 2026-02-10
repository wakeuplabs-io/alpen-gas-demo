import { TransactionStatus } from "./transaction";

export type CounterState = {
  count: number;
  incrementStatus: TransactionStatus;
  lastEventNewCount: number;
  block: number;
  timestamp: string;
};

export type CounterActions = {
  onIncrementTransactionStart: () => void;
  onIncrementTransactionStatusChangeToPreparing: () => void;
  onIncrementTransactionStatusChangeToPending: (hash: string) => void;
  onIncrementTransactionStatusChangeToSuccess: () => void;
  onIncrementTransactionStatusChangeToFailed: () => void;
};