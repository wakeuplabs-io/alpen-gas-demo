import { useMemo, useState } from "react";
import { SponsorshipState, SponsorshipStatus } from "@/types/sponsorship";
import { useWallet } from "./use-wallet";
import { useRequestSponsorship } from "./use-request-sponsorship";

const DEFAULT_SPONSORSHIP_STATE: SponsorshipState = {
  status: SponsorshipStatus.UNCHECKED,
  dailyRemaining: 0,
  dailyLimit: 0,
  globalDailyLimit: 0,
};

export function useSponsorship() {
  const [enabled, setEnabled] = useState(false);

  // Hooks
  const { address, operationalAddress } = useWallet();
  const { data, isLoading, error, refetch } = useRequestSponsorship(
    address || undefined,
    operationalAddress || undefined,
    { enabled }
  );

  const sponsorship = useMemo<SponsorshipState>(() => {
    if (isLoading) {
      return { ...DEFAULT_SPONSORSHIP_STATE, status: SponsorshipStatus.CHECKING };
    }

    if (!enabled) {
      return { ...DEFAULT_SPONSORSHIP_STATE, status: SponsorshipStatus.UNCHECKED };
    }

    if (error || !data) {
      return { ...DEFAULT_SPONSORSHIP_STATE, status: SponsorshipStatus.SERVICE_DOWN };
    }

    let status: SponsorshipStatus = SponsorshipStatus.ELIGIBLE;
    if (!data.eligible) {
      if (data.reason === "DailyLimitReached") {
        status = SponsorshipStatus.DAILY_LIMIT;
      } else if (data.reason === "WalletNotEligible") {
        status = SponsorshipStatus.POLICY_DENY;
      } else {
        status = SponsorshipStatus.POLICY_DENY;
      }
    }

    const dailyRemaining = Math.max(0, data.dailyLimit - data.dailyUsage);

    return {
      status,
      dailyRemaining,
      dailyLimit: data.dailyLimit,
      globalDailyLimit: data.globalDailyLimit,
    };
  }, [data, isLoading, error]);

  const checkEligibility = async (): Promise<SponsorshipState> => {
    if (!address && !operationalAddress) {
      throw new Error("Wallet address not available");
    }

    setEnabled(true);

    try {
      const result = await refetch();
      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        throw new Error("No data received");
      }

      let status: SponsorshipStatus = SponsorshipStatus.ELIGIBLE;
      if (!result.data.eligible) {
        if (result.data.reason === "DailyLimitReached") {
          status = SponsorshipStatus.DAILY_LIMIT;
        } else if (result.data.reason === "WalletNotEligible") {
          status = SponsorshipStatus.POLICY_DENY;
        } else {
          status = SponsorshipStatus.POLICY_DENY;
        }
      }

      const dailyRemaining = Math.max(0, result.data.dailyLimit - result.data.dailyUsage);

      return {
        status,
        dailyRemaining,
        dailyLimit: result.data.dailyLimit,
        globalDailyLimit: result.data.globalDailyLimit,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to check sponsorship eligibility");
      throw error;
    }
  };

  return {
    sponsorship,
    checkEligibility,
    error: error || null,
    refetch,
  };
}
