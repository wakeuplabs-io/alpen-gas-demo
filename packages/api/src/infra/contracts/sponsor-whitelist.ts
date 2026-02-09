import { ethers } from "ethers";
import { env } from "../../config/env";

const provider = new ethers.JsonRpcProvider(env.rpcUrl);

const SponsorWhitelistABI = [
  "function checkEligibility(address wallet) external view returns (bool eligible, string memory reason)",
  "function dailyLimit() external view returns (uint256)",
  "function dailyUsage(address wallet) external view returns (uint256)",
] as const;

export interface CheckEligibilityResult {
  eligible: boolean;
  reason: string | null;
  dailyLimit: number;
  dailyUsage: number;
}

export class SponsorWhitelistService {
  private provider: ethers.Provider;
  private contractAddress: string;

  constructor(contractAddress: string) {
    this.provider = provider;
    this.contractAddress = contractAddress;
  }

  /**
   * Checks if a wallet is eligible for sponsorship by querying the SponsorWhitelist contract
   * Returns eligibility status, reason if not eligible, and daily usage information
   */
  public async checkEligibility(walletAddress: string, operationalAddress: string): Promise<CheckEligibilityResult> {
    try {
      const contract = new ethers.Contract(
        this.contractAddress,
        SponsorWhitelistABI,
        this.provider
      );

      const [eligible, reason] = await contract.checkEligibility(walletAddress);
      const dailyLimit = await contract.dailyLimit();
      const dailyUsage = await contract.dailyUsage(operationalAddress);

      return {
        eligible: Boolean(eligible),
        reason: reason && reason !== "" ? String(reason) : null,
        dailyLimit: Number(dailyLimit),
        dailyUsage: Number(dailyUsage),
      };
    } catch (error) {
      throw new Error(
        `Failed to check eligibility for ${walletAddress}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
