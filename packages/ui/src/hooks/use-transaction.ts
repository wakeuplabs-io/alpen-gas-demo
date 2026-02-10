import { EXPLORER_URL } from "@/lib/network";
import { TransactionActions, TransactionState, TransactionStatus } from "@/types/transaction";
import { useState } from "react";
import { useDelegate } from "./use-delegate";
import { env } from "@/config/env";
import { IncrementCall } from "@/infra/counter-serivce";

export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { setupDelegate, signTransaction: signTransactionDelegate, transactDelegate } = useDelegate();


  const startTransaction = () => {
    try {
      setStatus(TransactionStatus.PREPARING);
  
      setupDelegate({ implementation: env.batchCallAndSponsorAddress });
    } catch (error) {
      setStatus(TransactionStatus.FAILED);
      console.error(error);
      throw error;
    } finally {
      setStatus(TransactionStatus.AWAITING_SIGNATURE);
    }
  }

  const signTransaction =async (): Promise<string> => {
    try {
      setStatus(TransactionStatus.PENDING);
      const signature = await signTransactionDelegate({ calls: [IncrementCall] });
      return signature;
    } catch (error) {
      setStatus(TransactionStatus.FAILED);
      console.error(error);
      throw error;
    }
  }

  const transactTransaction = async (signature: string): Promise<void> => {
    try {
      if (!signature) {
        setStatus(TransactionStatus.FAILED);
        return;
      }

      setStatus(TransactionStatus.PENDING);
      const response = await transactDelegate({ calls: [IncrementCall], signature });

      setStatus(TransactionStatus.SUCCESS);
      setTxHash(response.hash);
    } catch (error) {
      setStatus(TransactionStatus.FAILED);
      console.error(error);
      throw error;
    }
  }

  const resetTransaction = () => {
    setStatus(TransactionStatus.IDLE);
    setTxHash(null);
  }

  return {
    state: {
      status,
      txHash: txHash || undefined,
      explorerUrl: txHash ? `${EXPLORER_URL}/tx/${txHash}` : undefined,
    } satisfies TransactionState,
    actions: {
      startTransaction,
      signTransaction,
      transactTransaction,
      resetTransaction,
    } satisfies TransactionActions,
  };
}