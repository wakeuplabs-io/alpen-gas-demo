import { Contract, JsonRpcProvider } from "ethers";
import { PROVIDER } from "../lib/network";
import { env } from "@/config/env";

// EIP-7702 implementation contract - BatchCallAndSponsor
// This address should be set via environment variable or deployment
export const BATCH_CALL_AND_SPONSOR_ADDRESS = import.meta.env.VITE_BATCH_CALL_AND_SPONSOR || import.meta.env.VITE_SIMPLE7702_ACCOUNT || "0x0000000000000000000000000000000000000000";

export const BATCH_CALL_AND_SPONSOR_ABI = [
  "function execute((address,uint256,bytes)[],bytes) external payable",
  "function execute((address,uint256,bytes)[]) external payable",
  "function nonce() view returns (uint256)",
] as const;

// Demo contracts - these should be set via environment variables
export const COUNTER_ADDRESS = env.counterAddress;
export const COUNTER_ABI = [
  "function increment() external",
  "function number() view returns (uint256)",
  "function setNumber(uint256 newNumber) external",
] as const;

// Helper to create contract instances
export function createContract(address: string, abi: readonly any[], provider: JsonRpcProvider = PROVIDER) {
  return new Contract(address, abi, provider);
}
