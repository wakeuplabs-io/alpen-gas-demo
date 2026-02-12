import { Contract, JsonRpcProvider } from 'ethers';
import { ApiTraceEntry } from '@/types/api-trace';

let addTraceCallback: ((entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void) | null = null;

export function setContractTraceCallback(
  callback: (entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void
) {
  addTraceCallback = callback;
}

const TRACED_METHODS = [
  'increment',
  'checkEligibility',
  'dailyLimit',
  'dailyUsage',
  'globalDailyLimit',
  'getTodayGlobalUsage',
];

export function createTracedContract(
  address: string,
  abi: readonly any[],
  provider: JsonRpcProvider
): Contract {
  const contract = new Contract(address, abi, provider);
  
  const tracedContract = new Proxy(contract, {
    get(target, prop) {
      const original = target[prop as keyof Contract];
      const methodName = prop as string;
      
      if (typeof original === 'function' && 
          prop !== 'interface' && 
          prop !== 'provider' && 
          prop !== 'target' &&
          prop !== 'queryFilter' &&
          TRACED_METHODS.includes(methodName)) {
        return function (...args: any[]) {
          const startTime = performance.now();
          const endpoint = `${address.slice(0, 10)}...${address.slice(-8)}.${methodName}`;
          
          return (original as Function).apply(target, args)
            .then((result: any) => {
              const duration = Math.round(performance.now() - startTime);
              
              if (addTraceCallback) {
                addTraceCallback({
                  source: 'contract',
                  method: 'CALL',
                  endpoint,
                  request: args.length > 0 ? { 
                    method: methodName,
                    args: args.map(arg => 
                      typeof arg === 'bigint' ? arg.toString() : 
                      typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : 
                      String(arg)
                    )
                  } : { method: methodName },
                  response: { 
                    result: typeof result === 'bigint' ? result.toString() : 
                           Array.isArray(result) ? result.map(r => typeof r === 'bigint' ? r.toString() : r) :
                           result 
                  },
                  status: 200,
                  duration,
                });
              }
              
              return result;
            })
            .catch((error: any) => {
              const duration = Math.round(performance.now() - startTime);
              
              if (addTraceCallback) {
                addTraceCallback({
                  source: 'contract',
                  method: 'CALL',
                  endpoint,
                  request: args.length > 0 ? { 
                    method: methodName,
                    args: args.map(arg => 
                      typeof arg === 'bigint' ? arg.toString() : 
                      typeof arg === 'object' && arg !== null ? JSON.stringify(arg) : 
                      String(arg)
                    )
                  } : { method: methodName },
                  response: { error: error instanceof Error ? error.message : 'Unknown error' },
                  status: 0,
                  duration,
                });
              }
              
              throw error;
            });
        };
      }
      
      return original;
    },
  });
  
  return tracedContract as Contract;
}
