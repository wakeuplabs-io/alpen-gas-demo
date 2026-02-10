import { useQuery } from '@tanstack/react-query';
import { requestSponsorship, RequestSponsorshipResponse } from '@/infra/api/sponsor';

export function useRequestSponsorship(address: string | undefined, operationalAddress: string | undefined, options?: { enabled?: boolean }) {
  return useQuery<RequestSponsorshipResponse, Error>({
    queryKey: ['sponsorship', address],
    queryFn: () => {
      if (!address || !operationalAddress) {
        throw new Error('Address is required');
      }
      return requestSponsorship(address, operationalAddress);
    },
    enabled: options?.enabled !== false && !!address,
  });
}
