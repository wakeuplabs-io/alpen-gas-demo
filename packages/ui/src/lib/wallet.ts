import { Address, WalletStatus } from "@/types/wallet";
import { CHAIN_ID } from "@/lib/network";
import { User } from "@privy-io/react-auth";

/**
 * Finds the EOA (Externally Owned Account) and operational address from user's linked accounts
 */
export function getWalletsAddresses(user: User | null) {
  const eoaAddress = user?.linkedAccounts?.find((account) => {
    if (account.type !== 'wallet') return false;
    const walletAccount = account;
    const clientType = walletAccount.walletClientType;
    return clientType && clientType !== 'privy' && clientType !== 'embedded';
  }) as { address: Address };

  const operationalAddress = user?.linkedAccounts?.find((account) => {
    if (account.type !== 'wallet') return false;
    const walletAccount = account;
    const clientType = walletAccount.walletClientType;
    return clientType && clientType === 'privy' || clientType === 'embedded';
  }) as { address: Address };

  return [
    eoaAddress ? eoaAddress.address : null,
    operationalAddress ? operationalAddress.address : null
  ];
}

/**
 * Parses chain ID from EIP-155 format (e.g., "eip155:8150") or returns numeric value
 */
export function parseChainId(chainId: string | number | undefined | null): number | null {
  if (!chainId) return null;
  
  if (typeof chainId === 'string' && chainId.includes(':')) {
    return parseInt(chainId.split(':')[1], 10);
  }
  
  if (typeof chainId === 'number') {
    return chainId;
  }
  
  return parseInt(chainId, 10);
}

/**
 * Gets the wallet status based on connection state and chain ID
 */
export function getWalletStatus(
  ready: boolean,
  authenticated: boolean,
  address: string | null,
  chainId: string | number | undefined | null
): WalletStatus {
  if (!ready) return WalletStatus.CONNECTING;
  
  if (!authenticated || !address) return WalletStatus.DISCONNECTED;

  if (chainId) {
    const numericChainId = parseChainId(chainId);
    
    if (numericChainId === CHAIN_ID) return WalletStatus.CONNECTED;
    else return WalletStatus.WRONG_NETWORK;
  }
  
  return WalletStatus.CONNECTED;
}
