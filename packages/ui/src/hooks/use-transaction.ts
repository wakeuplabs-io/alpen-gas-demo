import { EXPLORER_URL } from "@/lib/network";
import { TransactionActions, TransactionState, TransactionStatus } from "@/types/transaction";
import { useEffect, useState } from "react";
import { useDelegate } from "./use-delegate";
import { env } from "@/config/env";
import { CounterService, IncrementCall } from "@/infra/counter-serivce";
import { useQueryClient } from "@tanstack/react-query";
import { isDelegatedToImplementation } from "@/lib/delegation";
import { useWallet } from "./use-wallet";

const counterService = new CounterService();

export function useTransaction() {
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.IDLE);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { operationalAddress: user, walletAccount } = useWallet();
  const queryClient = useQueryClient();
  const { setupDelegate, signTransaction: signTransactionDelegate, transactDelegate } = useDelegate();

  useEffect(() => {

    const checkDelegation = async () => {
      if (!user) {
        return;
      }

      if (status === TransactionStatus.DELEGATING) {
        const isDelegated = await isDelegatedToImplementation(user, env.batchCallAndSponsorAddress);
        if (isDelegated) {
          setStatus(TransactionStatus.AWAITING_SIGNATURE);
        }
      }
    }

    checkDelegation();
  }, [status]);

  const startTransaction = async () => {
    try {
      setStatus(TransactionStatus.PREPARING);

      if (!user) {
        throw new Error("Please connect your wallet first");
      }

      const isDelegated = await isDelegatedToImplementation(user, env.batchCallAndSponsorAddress || "");
      if (!isDelegated) {
        await setupDelegate({ implementation: env.batchCallAndSponsorAddress || "" });
      }

      setStatus(TransactionStatus.DELEGATING);
    } catch (error) {
      setStatus(TransactionStatus.FAILED);
      console.error(error);
      throw error;
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

      await handleRefreshTransaction();

    } catch (error) {
      setStatus(TransactionStatus.FAILED);
      console.error(error);
      throw error;
    }
  }

  const handleRefreshTransaction = async (): Promise<void> => {
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["counter"] }),
      queryClient.refetchQueries({ queryKey: ["sponsorship"] }),
      queryClient.refetchQueries({ queryKey: ["last-event"] }),
    ]);
  }

  const resetTransaction = () => {
    setStatus(TransactionStatus.IDLE);
    setTxHash(null);
  }

  const executeEoaTransaction = async () => {
    if (!walletAccount) {
      setStatus(TransactionStatus.FAILED);
      return;
    }

    try {
      setStatus(TransactionStatus.PENDING);

      const tx = await counterService.increment(walletAccount);
      setTxHash(tx);
      setStatus(TransactionStatus.SUCCESS);
      await handleRefreshTransaction();

    } catch (error) {
      setStatus(TransactionStatus.FAILED);
      console.error(error);
      throw error;
    }
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
      executeEoaTransaction,
    } satisfies TransactionActions,
  };
}