import { ethers } from "ethers";
import { env } from "../../config/env";

const provider = new ethers.JsonRpcProvider(env.rpcUrl);
const wallet = env.sponsorPrivateKey
  ? new ethers.Wallet(env.sponsorPrivateKey, provider)
  : null;

// BatchCallAndSponsor ABI - matches the contract interface
export const abi = [
  "function execute((address,uint256,bytes)[],bytes,address) external payable",
  "function execute((address,uint256,bytes)[]) external payable",
  "function nonce() view returns (uint256)",
] as const;

export const batchCallAndSponsor = {
  provider,
  wallet: wallet,
  address: env.batchCallAndSponsorAddress,
  abi,
}