import { PROVIDER } from "@/lib/network";
import { COUNTER_ABI, COUNTER_ADDRESS, createContract } from "./contracts";
import { Call } from "@/types/delegate";
import { ConnectedWallet } from "@privy-io/react-auth";
import { BrowserProvider, Contract } from "ethers";

const counterContract = createContract(COUNTER_ADDRESS, COUNTER_ABI, PROVIDER);

export class CounterService {

  async increment(walletAccount: ConnectedWallet): Promise<string> {
    try {
      const ethereumProvider = await walletAccount.getEthereumProvider();
      const provider = new BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const counterContractWithSigner = new Contract(COUNTER_ADDRESS, COUNTER_ABI, signer);
      const tx = await counterContractWithSigner.increment();

      return tx.hash;
    } catch (error) {
      console.error('Error incrementing counter:', error);
      throw error;
    }
  }

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