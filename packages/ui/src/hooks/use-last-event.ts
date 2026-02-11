import { useEffect, useState } from "react";
import { COUNTER_ADDRESS } from "@/infra/contracts";
import { LastEvent } from "@/types/event";
import { CounterEventService } from "@/infra/counter-event-service";

export function useLastEvent() {
  const [lastEvent, setLastEvent] = useState<LastEvent | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!COUNTER_ADDRESS) {
      setIsLoading(false);
      return;
    }

    const fetchLastEvent = async () => {
      try {
        setIsLoading(true);
        const eventService = new CounterEventService();
        const event = await eventService.getLastEvent();
        setLastEvent(event);
      } catch (error) {
        console.error("Error fetching last event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastEvent();
  }, []);

  return { lastEvent, isLoading };
} 