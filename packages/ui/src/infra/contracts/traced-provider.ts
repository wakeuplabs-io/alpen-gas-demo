import { JsonRpcProvider } from 'ethers';
import { ApiTraceEntry } from '@/types/api-trace';

let addTraceCallback: ((entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void) | null = null;

export function setProviderTraceCallback(
  callback: (entry: Omit<ApiTraceEntry, 'id' | 'timestamp'>) => void
) {
  addTraceCallback = callback;
}

// Function selectors for simple queries that should NOT be traced
const EXCLUDED_SELECTORS = new Set([
  '0xaffed0e0', // nonce() - simple query
  '0x67eeba0c', // nonce() - alternative selector (if different ABI encoding)
]);

// Function selectors for relevant contract methods that SHOULD be traced
const RELEVANT_SELECTORS = new Set([
  '0xd09de08a', // increment()
  '0x6171d1c9', // execute((address,uint256,bytes)[],bytes)
  '0x6171d1c9', // execute((address,uint256,bytes)[])
  '0x8f283970', // checkEligibility(address)
  '0x70a08231', // balanceOf(address) - if using tokens
  // Add more relevant selectors as needed
]);

/**
 * Checks if an RPC call is a relevant contract method call (not just a simple query)
 */
function isContractMethodCall(method: string, params?: any[]): boolean {
  if (!params || params.length === 0) {
    return false;
  }

  // eth_call - contract read/write calls
  if (method === 'eth_call') {
    const callObject = params[0];
    if (!callObject || typeof callObject !== 'object' || !callObject.to || !callObject.data) {
      return false;
    }
    
    // Must have data (method call)
    if (callObject.data === '0x' || callObject.data.length <= 2) {
      return false;
    }
    
    // Extract function selector (first 4 bytes = 10 hex chars including 0x)
    const selector = callObject.data.slice(0, 10);
    
    // Exclude simple queries
    if (EXCLUDED_SELECTORS.has(selector)) {
      return false;
    }
    
    // Include relevant methods if specified, otherwise include all except excluded
    if (RELEVANT_SELECTORS.size > 0) {
      return RELEVANT_SELECTORS.has(selector);
    }
    
    // Default: include all contract calls except excluded ones
    return true;
  }

  // eth_sendRawTransaction - contract transactions (always relevant)
  if (method === 'eth_sendRawTransaction') {
    const rawTx = params[0];
    return typeof rawTx === 'string' && rawTx.startsWith('0x') && rawTx.length > 2;
  }

  // eth_estimateGas - gas estimation for contract calls (always relevant)
  if (method === 'eth_estimateGas') {
    const callObject = params[0];
    return callObject && 
           typeof callObject === 'object' && 
           callObject.to && 
           callObject.data && 
           callObject.data !== '0x' &&
           callObject.data.length > 2;
  }

  // All other methods are not contract method calls
  return false;
}

export function createTracedProvider(baseProvider: JsonRpcProvider): JsonRpcProvider {
  // Store the original 'send' method
  const originalSend = baseProvider.send.bind(baseProvider);
  
  // Override only the 'send' method directly on the provider
  // This avoids Proxy interference with private methods
  (baseProvider as any).send = function (method: string, params?: any[]) {
    const isRelevant = isContractMethodCall(method, params);
    const startTime = isRelevant ? performance.now() : 0;
    const endpoint = `rpc.${method}`;
    
    return originalSend(method, params || [])
      .then((result: any) => {
        // Only trace actual contract method calls
        if (isRelevant && addTraceCallback) {
          const duration = Math.round(performance.now() - startTime);
          
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
        // Only trace errors for actual contract method calls
        if (isRelevant && addTraceCallback) {
          const duration = Math.round(performance.now() - startTime);
          
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
  
  // Return the provider with the overridden 'send' method
  // All other methods and properties remain untouched
  return baseProvider;
}
