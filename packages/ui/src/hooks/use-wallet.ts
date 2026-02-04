import { useAccount, useBalance } from "wagmi";

import { ChainId } from "@/types/chain";
import { Wallet, WalletStatus } from "@/types/wallet";

export function useWallet() {
  const { isConnected, isConnecting, address, chainId } = useAccount();
  const { data: balance } = useBalance({ address, chainId: ChainId.ALPEN_TESTNET });

  const getStatus = () => {
    if (!isConnected) return WalletStatus.DISCONNECTED;
    
    if (isConnecting) return WalletStatus.CONNECTING;

    if (address && chainId) {
      if (chainId === ChainId.ALPEN_TESTNET) return WalletStatus.CONNECTED;
      else return WalletStatus.WRONG_NETWORK;
    }
    return WalletStatus.DISCONNECTED;
  };


  return {
    status: getStatus(),
    address: address ?? null,
    balance: balance ? balance.value.toString() : '0',
  } satisfies Wallet;
} 