import { JsonRpcProvider } from "ethers";
import { createTracedProvider } from "@/infra/contracts/traced-provider";

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
export const EXPLORER_URL = "https://explorer.testnet.alpenlabs.io";
export const CHAIN_ID = 8150;
const baseProvider = new JsonRpcProvider(RPC_URL);
export const PROVIDER = createTracedProvider(baseProvider);
