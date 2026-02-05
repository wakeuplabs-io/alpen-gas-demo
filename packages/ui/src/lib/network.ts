import { JsonRpcProvider } from "ethers";

export const CHAIN = {
  id: 8150,
  name: "Alpen Testnet",
  nativeCurrency: {
    name: "signet Bitcoin",
    symbol: "sBTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.alpenlabs.io"],
    }
  },
  blockExplorers: {
    default: {
      name: "Alpen Testnet Explorer",
      url: "https://explorer.testnet.alpenlabs.io",
    },
  },
} as const;

export const RPC_URL = "https://rpc.testnet.alpenlabs.io";
export const CHAIN_ID = 8150;
export const PROVIDER = new JsonRpcProvider(RPC_URL);
