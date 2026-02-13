import { toast } from "sonner";
import { CHAIN_ID } from "@/lib/network";
import { parseChainId } from "@/lib/wallet";
import { useEffect, useState } from "react";
import { useWallet } from "./use-wallet";

export function useChain() {
  // States
  const [isWrongNetwork, setIsWrongNetwork] = useState<boolean>(false);

  // Hooks
  const { walletAccount } = useWallet();

  useEffect(() => {
    if (walletAccount && walletAccount.chainId) {
      if (parseChainId(walletAccount.chainId) !== CHAIN_ID) {
        setIsWrongNetwork(true);
      } else {
        setIsWrongNetwork(false);
      }
    }
  }, [walletAccount?.chainId]);

  const handleSwitchNetwork = async () => {
    try {
      // Privy handles chain switching automatically for embedded wallets
      // For external wallets, we can try to switch
      if (walletAccount) {
        // Try to switch chain if supported
        await walletAccount.switchChain(CHAIN_ID);
        setIsWrongNetwork(false);
        toast.success('Network switched successfully', {
          description: 'You are now connected to Alpen Testnet.',
        });
      }

    } catch (error) {
      toast.error('Failed to switch network', {
        description: error instanceof Error ? error.message : 'Please switch the network manually in your wallet.',
      });
    }
  }

  return { handleSwitchNetwork, isWrongNetwork };
}