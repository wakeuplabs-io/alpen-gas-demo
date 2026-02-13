import { ConnectedWallet } from "@privy-io/react-auth";

export enum WalletStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  WRONG_NETWORK = 'wrong-network',
}

export interface Wallet {
  status: WalletStatus;
  address: Address | null;
  operationalAddress: Address | null;
  balance: string;
  walletAccount: ConnectedWallet | null;
}

export type Address = `0x${string}`;