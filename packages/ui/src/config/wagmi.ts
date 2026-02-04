import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";
import { env } from "./env";

// Configuration of Alpen Testnet
const alpenTestnet = defineChain({
  id: 8150,
  name: 'Alpen Testnet',
  network: 'alpen',
  nativeCurrency: {
    name: 'Signet BTC',
    symbol: 'sBTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.alpenlabs.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Alpen Explorer',
      url: 'https://explorer.testnet.alpenlabs.io',
    },
  },
});

export const config = getDefaultConfig({
  appName: 'BTC-Gas EVM Counter Demo',
  projectId: env.projectId,
  chains: [alpenTestnet],
  ssr: false,
});