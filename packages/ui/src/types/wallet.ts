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
}

export type Address = `0x${string}`;