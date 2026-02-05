import { CounterService } from "@/infra/counter-serivce";
import { CounterState } from "@/types/counter";
import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { useDelegate } from "./use-delegate";
import { Contract } from "ethers";
import { COUNTER_ADDRESS, COUNTER_ABI } from "@/infra/contracts";

const counterService = new CounterService();

export function useCounter() {
  const { wallets } = useWallets();
  const delegate = useDelegate();
  const [count, setCount] = useState<number>(0);
  const [isIncrementing, setIsIncrementing] = useState(false);

  useEffect(() => {
    counterService.getCount().then(setCount);
  }, []);

  const increment = async () => {
    if (!wallets || wallets.length === 0) {
      throw new Error('Please connect your wallet first');
    }
    
    setIsIncrementing(true);
    try {
      // Create contract instance to encode function call
      const counterContract = new Contract(COUNTER_ADDRESS, COUNTER_ABI);
      
      // Encode the increment() function call
      const data = counterContract.interface.encodeFunctionData("increment");
      
      // Execute increment via EIP-7702 delegation
      await delegate.transact({ calls: [{
        to: COUNTER_ADDRESS,
        value: "0",
        data: data,
      }] });

      // Refresh count after transaction
      await counterService.getCount().then(setCount);
    } finally {
      setIsIncrementing(false);
    }
  };

  return {
    count,
    lastEventNewCount: 0,
    block: 0,
    timestamp: new Date().toISOString(),
    increment,
    isIncrementing,
  } satisfies CounterState & { increment: () => Promise<void>; isIncrementing: boolean };
}