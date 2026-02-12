import { PROVIDER } from "@/lib/network";
import { COUNTER_ABI, COUNTER_ADDRESS, createContract } from "./contracts";
import { Call } from "@/types/delegate";

const counterContract = createContract(COUNTER_ADDRESS, COUNTER_ABI, PROVIDER);

export class CounterService {

  async getCount(): Promise<number> {
    try {
      const count = await counterContract.number();

      return count ? Number(count) : 0;
    } catch (error) {
      console.error('Error reading count:', error);
      return 0;
    }
  }
}

export const IncrementCall: Call = 
  {
    to: COUNTER_ADDRESS,
    value: "0",
     data: counterContract.interface.encodeFunctionData("increment"),

  } as Call;