import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { PROVIDER, CHAIN_ID } from "@/lib/network";
import { Wallet, WalletStatus } from "@/types/wallet";

export function useWallet() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string>('0');

  const address = wallets && wallets.length > 0 ? wallets[0].address : null;
  const chainId = wallets && wallets.length > 0 ? wallets[0].chainId : null;

  // Fetch balance
  useEffect(() => {
    if (address) {
      PROVIDER.getBalance(address as `0x${string}`).then((bal) => {
        setBalance(bal.toString());
      });
    }
  }, [address]);

  const getStatus = () => {
    if (!ready) return WalletStatus.CONNECTING;
    
    if (!authenticated || !address) return WalletStatus.DISCONNECTED;

    if (chainId) {
      // Privy returns chain IDs in EIP-155 format (e.g., "eip155:8150")
      // Extract the numeric part for comparison
      const numericChainId = typeof chainId === 'string' && chainId.includes(':')
        ? parseInt(chainId.split(':')[1], 10)
        : typeof chainId === 'number'
        ? chainId
        : parseInt(chainId, 10);
      
      if (numericChainId === CHAIN_ID) return WalletStatus.CONNECTED;
      else return WalletStatus.WRONG_NETWORK;
    }
    
    return WalletStatus.CONNECTED; // Default to connected if we have an address
  };

  return {
    status: getStatus(),
    address: address as `0x${string}` | null,
    balance,
  } satisfies Wallet;
} 