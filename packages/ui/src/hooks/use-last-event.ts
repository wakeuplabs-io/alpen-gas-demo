import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { COUNTER_ADDRESS } from "@/infra/contracts";
import { LastEvent } from "@/types/event";
import { CounterEventService } from "@/infra/counter-event-service";

export function useLastEvent() {
  const query = useQuery({
    queryKey: ["last-event"],
    queryFn: async () => {
      const eventService = new CounterEventService();
      return await eventService.getLastEvent();
    },
    enabled: !!COUNTER_ADDRESS,
  }) satisfies UseQueryResult<LastEvent | undefined>;

  return {
    lastEvent: query.data,
    isLoading: query.isLoading,
  };
} 