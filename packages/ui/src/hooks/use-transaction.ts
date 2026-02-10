import { EXPLORER_URL } from "@/lib/network";
import { TransactionState, TransactionStatus } from "@/types/transaction";
import { useState } from "react";

export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);


  const onTransactionStatusChangeToPreparing = () => {
    setStatus(TransactionStatus.PREPARING);
  } 

  const onTransactionStatusChangeToPending = (hash: string) => {
    setStatus(TransactionStatus.PENDING);
    setTxHash(hash);
  }

  const onTransactionStatusChangeToSuccess = () => {
    setStatus(TransactionStatus.SUCCESS);
  }

  const onTransactionStatusChangeToFailed = () => {
    setStatus(TransactionStatus.FAILED);
  }

  return {
    status,
    txHash: txHash || undefined,
    explorerUrl: txHash ? `${EXPLORER_URL}/tx/${txHash}` : undefined,
    onTransactionStatusChangeToPreparing,
    onTransactionStatusChangeToPending,
    onTransactionStatusChangeToSuccess,
    onTransactionStatusChangeToFailed,
  } satisfies TransactionState;
}