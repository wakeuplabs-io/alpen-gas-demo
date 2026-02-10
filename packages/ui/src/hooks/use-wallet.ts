import { usePrivy, useWallets, useUser } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { PROVIDER, CHAIN_ID } from "@/lib/network";
import { Wallet, WalletStatus } from "@/types/wallet";

export function useWallet() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { user } = useUser();
  const [balance, setBalance] = useState<string>('0');


  const embeddedWallet = wallets?.find(wallet => {
    const clientType = (wallet as any).walletClientType;
    const connectorType = (wallet as any).connectorType;
    return clientType === 'privy' || connectorType === 'embedded';
  });
  
  const eoaAccount = user?.linkedAccounts?.find(account => {
    if (account.type !== 'wallet') return false;
    const walletAccount = account as any;
    const clientType = walletAccount.walletClientType;
    return clientType && clientType !== 'privy' && clientType !== 'embedded';
  }) as any;
  
  const operationalAddress = embeddedWallet?.address || null;
  const displayAddress = eoaAccount?.address || embeddedWallet?.address || null;
  const address = displayAddress;
  const chainId = wallets?.[0]?.chainId || null;

  useEffect(() => {
    if (eoaAccount?.address) {
      PROVIDER.getBalance(eoaAccount?.address as `0x${string}`).then((bal) => {
        setBalance(bal.toString());
      });
    }
  }, [operationalAddress]);

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
    operationalAddress: operationalAddress as `0x${string}` | null,
    balance,
  } satisfies Wallet & { operationalAddress: `0x${string}` | null };
} 