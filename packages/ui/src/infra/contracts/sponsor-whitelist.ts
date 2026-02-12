import { PROVIDER } from "@/lib/network";
import { createContract } from "../contracts";
import { SPONSOR_WHITELIST_ADDRESS, SPONSOR_WHITELIST_ABI } from "../contracts";

export interface SponsorWhitelistResult {
  eligible: boolean;
  reason: string | null;
  dailyLimit: number;
  dailyUsage: number;
  dailyRemaining: number;
}

export async function checkSponsorshipEligibility(walletAddress: string, operationalAddress: string): Promise<SponsorWhitelistResult> {
  const contract = createContract(
    SPONSOR_WHITELIST_ADDRESS,
    SPONSOR_WHITELIST_ABI,
    PROVIDER,
  );

  try {
    const [eligible, reason] = await contract.checkEligibility(walletAddress);
    const dailyLimit = await contract.dailyLimit();
    const dailyUsage = await contract.dailyUsage(operationalAddress);

    const dailyLimitNum = Number(dailyLimit);
    const dailyUsageNum = Number(dailyUsage);
    const dailyRemaining = Math.max(0, dailyLimitNum - dailyUsageNum);

    return {
      eligible: Boolean(eligible),
      reason: reason && reason !== "" ? String(reason) : null,
      dailyLimit: dailyLimitNum,
      dailyUsage: dailyUsageNum,
      dailyRemaining,
    };
  } catch (error) {
    throw new Error(
      `Failed to check sponsorship eligibility: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}


export async function getGlobalDailyUsage(): Promise<number> {
  const contract = createContract(
    SPONSOR_WHITELIST_ADDRESS,
    SPONSOR_WHITELIST_ABI,
    PROVIDER,
  );
  const globalDailyUsage = await contract.getTodayGlobalUsage();
  return Number(globalDailyUsage);
}


export async function getRateLimits(): Promise<{
  globalDailyLimit: number;
  dailyLimit: number;
}> {
  const contract = createContract(
    SPONSOR_WHITELIST_ADDRESS,
    SPONSOR_WHITELIST_ABI,
    PROVIDER,
  );
  const globalDailyLimit = await contract.globalDailyLimit();
  const dailyLimit = await contract.dailyLimit();
  return {
    globalDailyLimit: Number(globalDailyLimit),
    dailyLimit: Number(dailyLimit),
  };
}