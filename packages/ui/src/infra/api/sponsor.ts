import { env } from "@/config/env";

export interface RequestSponsorshipRequest {
  address: string;
}

export interface RequestSponsorshipResponse {
  eligible: boolean;
  reason: string | null;
  dailyLimit: number;
  dailyUsage: number;
  globalDailyLimit: number;
}

/**
 * Requests sponsorship eligibility check for a wallet address
 * Queries the SponsorWhitelist contract to determine if the wallet can receive gas sponsorship
 */
export async function requestSponsorship(
  address: string,
  operationalAddress: string
): Promise<RequestSponsorshipResponse> {
  const response = await fetch(`${env.apiUrl}/api/sponsor/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, operationalAddress }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to request sponsorship" }));
    throw new Error(error.error || "Failed to request sponsorship");
  }

  const result = await response.json();
  return result;
}
