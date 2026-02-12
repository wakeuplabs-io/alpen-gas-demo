import { JsonRpcProvider } from 'ethers';
import { ApiTraceEntry } from '@/types/api-trace';

let addTraceCallback: ((entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void) | null = null;

export function setProviderTraceCallback(
  callback: (entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void
) {
  addTraceCallback = callback;
}

export function createTracedProvider(baseProvider: JsonRpcProvider): JsonRpcProvider {
  const tracedProvider = new Proxy(baseProvider, {
    get(target, prop) {
      const original = target[prop as keyof JsonRpcProvider];
      
      // Wrap the send method to trace RPC calls
      if (prop === 'send' && typeof original === 'function') {
        return function (method: string, params?: any[]) {
          const startTime = performance.now();
          const endpoint = `rpc.${method}`;
          
          return (original as Function).apply(target, [method, params])
            .then((result: any) => {
              const duration = Math.round(performance.now() - startTime);
              
              if (addTraceCallback) {
                addTraceCallback({
                  source: 'contract',
                  method: 'CALL',
                  endpoint,
                  request: { method, params: params || [] },
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
                  request: { method, params: params || [] },
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
  
  return tracedProvider as JsonRpcProvider;
}
