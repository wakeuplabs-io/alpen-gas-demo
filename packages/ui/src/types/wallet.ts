export enum WalletStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  WRONG_NETWORK = 'wrong-network',
}

export interface Wallet {
  status: WalletStatus;
  address: `0x${string}` | null;
  balance: string;
}