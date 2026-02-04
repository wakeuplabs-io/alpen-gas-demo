import { Address } from "viem";

export enum WalletStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  WRONG_NETWORK = 'wrong-network',
}

export interface Wallet {
  status: WalletStatus;
  address: Address | null;
  balance: string;
}