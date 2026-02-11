import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getRateLimits } from "@/infra/contracts/sponsor-whitelist";

export function useGetRateLimits() {
  return useQuery({
    queryKey: ["rate-limits"],
    queryFn: () => getRateLimits(),
  }) satisfies UseQueryResult<{
    globalDailyLimit: number;
    dailyLimit: number;
  }>;
}