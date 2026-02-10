import { Contract } from "ethers";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CounterState } from "@/types/counter";
import { TransactionState } from "@/types/transaction";
import { CounterService } from "@/infra/counter-serivce";
import { COUNTER_ADDRESS, COUNTER_ABI } from "@/infra/contracts";

import { useTransaction } from "./use-transaction";
import { useDelegate } from "./use-delegate";
import { useWallet } from "./use-wallet";

const counterService = new CounterService();

export function useCounter() {
  const [count, setCount] = useState<number>(0);

  const transaction = useTransaction();
  const delegate = useDelegate(transaction);
  const queryClient = useQueryClient();
  const { address } = useWallet();

  useEffect(() => {
    counterService.getCount().then(setCount);
  }, []);

  const increment = async () => {

    transaction.onTransactionStatusChangeToPreparing();
    try {
      const counterContract = new Contract(COUNTER_ADDRESS, COUNTER_ABI);
      
      const data = counterContract.interface.encodeFunctionData("increment");
      
      await delegate.transact({ calls: [{
        to: COUNTER_ADDRESS,
        value: "0",
        data: data,
      }] });

      await counterService.getCount().then(setCount);
      transaction.onTransactionStatusChangeToSuccess();
      
      const addressToRefetch = address;
      if (addressToRefetch) {
        await queryClient.refetchQueries({ 
          queryKey: ['sponsorship', addressToRefetch],
        });
      }
    } catch (error) {
      transaction.onTransactionStatusChangeToFailed();
    }
  };

  return {
    count,
    lastEventNewCount: 0,
    block: 0,
    timestamp: new Date().toISOString(),
    increment,
    transaction,
  } satisfies CounterState & { increment: () => Promise<void>; transaction: TransactionState };
}