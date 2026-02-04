# Project Architecture Rules

## General Rules

- **Keep it simple**: Maintain the solution as simple as possible without covering many edge cases unless explicitly requested in the prompt
- **Minimal comments**: Do NOT add comments unless absolutely necessary. Code should be self-readable
- **JSDoc in backend methods**: All backend methods (handlers and services) must have simple and concise JSDoc comments that add information beyond the method name
- **English naming**: All names and comments must be in English

## Backend Architecture Overview

This project follows a clean but simple architecture with clear separation of concerns:

- **Route Handlers**: Handle HTTP requests, parse and validate input, call services, return responses
- **Infrastructure Services**: Encapsulate external API interactions and business logic (blockchain RPC, paymaster API, contract interactions)
- **Clear Boundaries**: Handlers should never directly access external APIs - always through the service layer

## Route Handler Patterns

### Documentation
- All route handler functions (POST, GET, PUT, DELETE, etc.) must have simple and concise JSDoc comments
- JSDoc must add information beyond the method name - avoid repeating what's already clear from the name
- JSDoc should be brief - one or two lines describing behavior, important parameters, or side effects
- Example: `/** Checks sponsorship eligibility for an address and returns cooldown status and daily limits */`

### Input Validation
- Always use Zod schemas for input validation
- Define schemas as constants (e.g., `CheckEligibilityParamsSchema`)
- Parse request body/params with Zod before processing: `const validatedData = Schema.parse(body)`
- Handle ZodError specifically and return 400 status with validation details

### Service Calls
- Handlers call services from the `infra/` layer only
- Never access external APIs directly from handlers
- Instantiate service classes as needed: `const serviceInstance = new ServiceClass()`
- Pass validated data and configuration to services

### Error Handling
- Catch `z.ZodError` and return 400 with error details:
  ```typescript
  if (error instanceof z.ZodError) {
    return c.json(
      { error: 'Invalid input', details: error.issues },
      400,
    );
  }
  ```
- Catch general errors and return 500:
  ```typescript
  return c.json(
    { error: 'Failed to check eligibility' },
    500,
  );
  ```
- Include console.error for debugging server-side errors

### Response Format
- Always use `c.json()` for JSON responses
- Return appropriate HTTP status codes (200, 400, 500, etc.)
- Include console.log for debugging when needed (but remove in production)

### Example Handler Structure
```typescript
import { z } from 'zod';
import { AppRouteHandler } from '../../lib/types';
import { EligibilityRoute } from './sponsor.routes';
import { PaymasterService } from '../../infra/paymaster/paymaster-service';

const CheckEligibilityParamsSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  contract: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  function: z.string(),
});

/**
 * Checks sponsorship eligibility for an address and returns cooldown status and daily limits
 * Validates address format and contract address before checking with paymaster service
 */
export const checkEligibilityHandler: AppRouteHandler<EligibilityRoute> = async (c) => {
  try {
    const body = await c.req.json();
    const validatedParams = CheckEligibilityParamsSchema.parse(body);
    
    const paymasterService = new PaymasterService();
    const result = await paymasterService.checkEligibility({
      address: validatedParams.address,
      chainId: validatedParams.chainId,
      contract: validatedParams.contract,
      functionName: validatedParams.function,
    });

    return c.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: 'Invalid input', details: error.issues },
        400,
      );
    }
    
    console.error('Failed to check eligibility:', error);
    return c.json(
      { error: 'Failed to check eligibility' },
      500,
    );
  }
};
```

## Infrastructure Services Layer

### Location and Structure
- Services must be located in the `infra/` directory
- Organize by provider/domain (e.g., `infra/blockchain/rpc-client.ts`, `infra/paymaster/paymaster-service.ts`)
- Services can extend base clients when applicable

### Documentation
- All public methods in services must have simple and concise JSDoc comments
- JSDoc must add information beyond the method name - avoid repeating what's already clear from the name
- JSDoc should be brief - one or two lines describing behavior, important parameters, side effects, or return value details
- Include JSDoc at the top of service files explaining:
  - What the service does
  - Architecture layer (infrastructure)
  - That it should never be accessed directly from handlers
- Example JSDoc format:
  ```typescript
  /**
   * Checks if an address is eligible for gas sponsorship and returns eligibility status
   * Includes cooldown period calculation and daily limit checking
   */
  async checkEligibility(params: CheckEligibilityParams): Promise<EligibilityResult>
  
  /**
   * Builds a UserOp with paymaster data for gas sponsorship
   * Calculates gas limits and generates sponsorship ID for tracking
   */
  async buildUserOp(params: BuildUserOpParams): Promise<BuildUserOpResult>
  ```

### TypeScript Interfaces
- Define TypeScript interfaces for all method parameters (e.g., `CheckEligibilityParams`)
- Define TypeScript interfaces for all return types (e.g., `EligibilityResult`)
- Export interfaces so they can be used by handlers
- Use descriptive, specific interface names

### Method Implementation
- Use descriptive method names (e.g., `checkEligibility`, `buildUserOp`, `submitUserOp`)
- All public methods must have simple and concise JSDoc comments
- Methods should be async and return Promises
- Handle idempotency keys when needed (e.g., using `crypto.randomUUID()`)
- Transform API responses to match internal interfaces (e.g., snake_case to camelCase)
- Include proper error handling with try-catch blocks
- Provide helpful error messages that include context (e.g., address, operation type)

### Service Class Structure
```typescript
/**
 * Paymaster service for gas sponsorship operations
 * Handles all interactions with the paymaster API including eligibility checks,
 * UserOp building, and transaction submission
 *
 * Architecture: This is infrastructure layer - never accessed directly from handlers
 * All external paymaster API interactions go through this service
 */

import { env } from '../../env';

export interface CheckEligibilityParams {
  address: string;
  chainId: number;
  contract: string;
  functionName: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string | null;
  cooldownSeconds: number;
  dailyRemaining: number;
  globalBudgetOk: boolean;
}

export class PaymasterService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = env.PAYMASTER_API_URL;
    this.apiKey = env.PAYMASTER_API_KEY;
  }

  /**
   * Checks if an address is eligible for gas sponsorship and returns eligibility status
   * Includes cooldown period calculation and daily limit checking
   */
  public async checkEligibility(params: CheckEligibilityParams): Promise<EligibilityResult> {
    try {
      const response = await fetch(`${this.apiUrl}/eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          address: params.address,
          chain_id: params.chainId,
          contract: params.contract,
          function: params.functionName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Paymaster API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        eligible: data.eligible,
        reason: data.reason || null,
        cooldownSeconds: data.cooldown_seconds || 0,
        dailyRemaining: data.daily_remaining || 0,
        globalBudgetOk: data.global_budget_ok || false,
      };
    } catch (error) {
      throw new Error(`Failed to check eligibility for ${params.address}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
```

### Request Handling
- Use fetch or HTTP client libraries for making requests
- Include necessary headers (e.g., authentication, content-type)
- Handle query parameters properly for GET requests
- Transform response data to match internal interfaces

## Frontend Architecture Rules

### Component Principles

- **Single Responsibility**: Components must have only one responsibility
- **No Logic in Components**: Components should not contain business logic - all logic must be in custom hooks
- **Presentation Only**: Components should focus on rendering UI and handling user interactions
- **Hook Integration**: Components use custom hooks to access data, state, and business logic

### Custom Hooks

- **Logic Container**: All business logic, API calls, and state management should be in custom hooks
- **Reusability**: Hooks should be reusable and independent of specific components
- **State Management**: Hooks manage their own state (loading, error, data)
- **Error Handling**: Hooks handle errors and expose error state to components

### Hook Structure

- Export TypeScript interfaces for hook parameters and return types
- Return an object with the hook's API (functions, state values)
- Handle errors appropriately and expose error state

### Example Hook Structure

```typescript
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface CheckEligibilityParams {
  address: string;
  chainId: number;
  contract: string;
  function: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string | null;
  cooldownSeconds: number;
  dailyRemaining: number;
  globalBudgetOk: boolean;
}

export const useSponsorship = () => {
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkEligibility = useCallback(
    async (params: CheckEligibilityParams): Promise<EligibilityResult> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiClient.sponsor.checkEligibility(params);
        setEligibility(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to check eligibility');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { 
    eligibility, 
    checkEligibility, 
    loading, 
    error 
  };
};
```

### Component Example

```typescript
import { useSponsorship } from '@/hooks/useSponsorship';
import { Button } from '@/components/ui/button';

export const GasStatusCard = () => {
  const { eligibility, checkEligibility, loading, error } = useSponsorship();
  const { address } = useWallet();

  const handleCheckEligibility = async () => {
    if (!address) return;
    
    try {
      await checkEligibility({
        address,
        chainId: 8150,
        contract: '0x1588967e1635F4aD686cB67EbfDCc1D0A89191Ca',
        function: 'increment',
      });
    } catch (err) {
      // Error is already handled in hook
    }
  };

  return (
    <div>
      {error && <div>Error: {error.message}</div>}
      <Button 
        onClick={handleCheckEligibility} 
        disabled={loading || !address}
      >
        {loading ? 'Checking...' : 'Check Eligibility'}
      </Button>
      {eligibility && (
        <div>
          Status: {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
        </div>
      )}
    </div>
  );
};
```

### File Structure

- **Components**: `components/` directory
- **Hooks**: `hooks/` directory
- **API Client**: `lib/api-client.ts`
- **One hook per file**: Each custom hook should be in its own file
- **Naming**: Hooks should be named with `use` prefix (e.g., `useSponsorship.ts`)

### Wallet Integration

- **wagmi + viem**: Use wagmi for wallet connections and viem for blockchain interactions
- **Provider Setup**: Wrap application with `WagmiProvider` and `QueryClientProvider`
- **Hooks**: Use wagmi hooks (e.g., `useAccount`, `useConnect`, `useDisconnect`) in custom hooks
- **Network Configuration**: Configure Alpen Testnet chain configuration

### Wallet Integration Example

```typescript
// lib/wagmi-config.ts
import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';

const alpenTestnet = defineChain({
  id: 8150,
  name: 'Alpen Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BTC',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.alpen.dev'],
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [alpenTestnet],
  connectors: [
    // Add connectors (MetaMask, Coinbase Wallet, etc.)
  ],
  transports: {
    [alpenTestnet.id]: http(),
  },
});
```

```typescript
// hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return {
    address,
    isConnected,
    chainId,
    balance: balance ? Number(balance.value) : 0,
    connect,
    disconnect,
    connectors,
  };
};
```

### Responsive Design

- **Mobile-First**: Design components with mobile-first approach
- **Breakpoints**: Use standard responsive breakpoints (sm, md, lg, xl)
- **Flexible Layouts**: Use flexbox and grid for responsive layouts
- **Touch Targets**: Ensure interactive elements have adequate touch target sizes (minimum 44x44px)
- **Viewport Units**: Use viewport-relative units (vw, vh) appropriately for responsive sizing
- **Media Queries**: Use CSS media queries or Tailwind responsive utilities for breakpoint-specific styles

### Best Practices

1. **Separation of Concerns**: Components handle UI, hooks handle logic
2. **Reusability**: Extract common logic into reusable hooks
3. **Type Safety**: Define TypeScript interfaces for all hook parameters and return types
4. **Error Handling**: Hooks should handle errors and expose error state
5. **Loading States**: Hooks should manage and expose loading states
6. **Memoization**: Use `useCallback` for functions that are returned from hooks
7. **Wallet Integration**: Use wagmi hooks in custom hooks, not directly in components
8. **Responsive Design**: Always ensure components work well on mobile, tablet, and desktop

## TypeScript & Code Quality

### Type Safety
- Use strict TypeScript types throughout
- Avoid `any` types - use proper interfaces or `unknown` with type guards
- Use type parameters for generic methods when appropriate

### Error Handling
- Always use try-catch blocks in service methods
- Provide context in error messages (include IDs, operation names, etc.)
- Re-throw errors with enhanced messages when appropriate
- Example: `throw new Error(\`Failed to check eligibility for ${params.address}: ${error.message}\`)`

### Code Organization
- Keep services focused on a single responsibility
- Group related methods together
- Use consistent naming conventions (camelCase for methods, PascalCase for classes/interfaces)

## File Structure

### Route Handlers
- Route handlers: `routes/[route]/[route].handler.ts`
- Route definitions: `routes/[route]/[route].routes.ts`
- Route registration: `routes/[route]/[route].index.ts`
- Keep handlers thin - validation and delegation only

### Services
- Infrastructure layer: `infra/[provider]/[service-name]-service.ts`
- Base clients: `infra/[provider]/base-client.ts` (if needed)
- One service class per file

### Constants
- Shared configuration: `env.ts` or `config/` directory
- Export configuration objects (e.g., `env`)

## Best Practices

1. **Simplicity First**: Keep solutions simple - avoid over-engineering and unnecessary edge cases
2. **Separation of Concerns**: Handlers handle HTTP, services handle business logic and external APIs
3. **Validation First**: Always validate input before processing
4. **Type Safety**: Use TypeScript interfaces for all data structures
5. **Error Context**: Include relevant context in error messages
6. **Self-Readable Code**: Write code that explains itself - avoid comments unless absolutely necessary
7. **Consistency**: Follow the same patterns across all handlers and services
8. **Frontend-Backend Separation**: Frontend hooks call API client, API client calls backend, backend handlers call services
