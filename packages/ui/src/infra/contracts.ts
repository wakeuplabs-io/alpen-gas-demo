import { Contract, JsonRpcProvider } from "ethers";
import { PROVIDER } from "../lib/network";
import { env } from "@/config/env";

// EIP-7702 implementation contract - BatchCallAndSponsor
// This address should be set via environment variable or deployment
export const BATCH_CALL_AND_SPONSOR_ADDRESS = env.batchCallAndSponsorAddress;

export const BATCH_CALL_AND_SPONSOR_ABI = [
  "function execute((address,uint256,bytes)[],bytes) external payable",
  "function execute((address,uint256,bytes)[]) external payable",
  "function nonce() view returns (uint256)",
] as const;

// Demo contracts - these should be set via environment variables
export const COUNTER_ADDRESS = env.counterAddress;
export const COUNTER_ABI = [
  "event Incremented()",
  "event NumberSet(uint256 newNumber)",
  "function increment() external",
  "function number() view returns (uint256)",
  "function setNumber(uint256 newNumber) external",
] as const;

// SponsorWhitelist contract
export const SPONSOR_WHITELIST_ADDRESS = import.meta.env.VITE_SPONSOR_WHITELIST || "0x7bF48b3e4a3843e939823DD62d2522E675d7d7B2";
export const SPONSOR_WHITELIST_ABI = [
  "function checkEligibility(address wallet) external view returns (bool eligible, string memory reason)",
  "function dailyLimit() external view returns (uint256)",
  "function dailyUsage(address wallet) external view returns (uint256)",
  "function globalDailyLimit() external view returns (uint256)",
] as const;

// Helper to create contract instances
export function createContract(address: string, abi: readonly any[], provider: JsonRpcProvider = PROVIDER) {
  return new Contract(address, abi, provider);
}
