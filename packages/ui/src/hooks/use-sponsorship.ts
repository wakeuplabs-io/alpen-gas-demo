import { useState, useCallback } from "react";
import { SponsorshipState, SponsorshipStatus } from "@/types/sponsorship";
import { checkSponsorshipEligibility } from "@/infra/contracts/sponsor-whitelist";
import { useWallet } from "./use-wallet";

export function useSponsorship() {
  const { address, operationalAddress } = useWallet();
  const [sponsorship, setSponsorship] = useState<SponsorshipState>({
    status: SponsorshipStatus.UNCHECKED,
    dailyRemaining: 0,
    dailyLimit: 0,
  });
  const [error, setError] = useState<Error | null>(null);


  /**
   * Checks sponsorship eligibility for the current wallet address
   * Queries the SponsorWhitelist contract on the blockchain to determine if the wallet can receive gas sponsorship
   */
  const checkEligibility = useCallback(async (): Promise<SponsorshipState> => {
    if (!address || !operationalAddress) {
      throw new Error("Wallet address not available");
    }

    setError(null);
    setSponsorship((prev) => ({ ...prev, status: SponsorshipStatus.CHECKING }));

    try {
      const result = await checkSponsorshipEligibility(address, operationalAddress);

      let status: SponsorshipStatus = SponsorshipStatus.ELIGIBLE;
      if (!result.eligible) {
        if (result.reason === "DailyLimitReached") {
          status = SponsorshipStatus.DAILY_LIMIT;
        } else if (result.reason === "WalletNotEligible") {
          status = SponsorshipStatus.POLICY_DENY;
        } else {
          status = SponsorshipStatus.POLICY_DENY;
        }
      }

      const newSponsorship: SponsorshipState = {
        status,
        dailyRemaining: result.dailyRemaining,
        dailyLimit: result.dailyLimit,
      };

      setSponsorship(newSponsorship);
      return newSponsorship;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to check sponsorship eligibility");
      setError(error);
      setSponsorship((prev) => ({
        ...prev,
        status: SponsorshipStatus.SERVICE_DOWN,
      }));
      throw error;
    }
  }, [address]);


  console.log("sponsorship", sponsorship);
  return {
    sponsorship,
    checkEligibility,
    error,
  };
}
