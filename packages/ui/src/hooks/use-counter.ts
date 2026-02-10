import { useEffect, useState } from "react";

import { CounterService } from "@/infra/counter-serivce";

const counterService = new CounterService();

export function useCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    counterService.getCount().then(setCount);
  }, []);


  return {
    count,
  };
}