import { useQuery, UseQueryResult } from "@tanstack/react-query";

import { CounterService } from "@/infra/counter-serivce";

const counterService = new CounterService();

export function useCounter() {
  return useQuery({
    queryKey: ["counter"],
    queryFn: () => counterService.getCount(),
  }) satisfies UseQueryResult<number>;
}