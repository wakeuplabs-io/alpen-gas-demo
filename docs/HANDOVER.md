# BTC-Gas EVM Counter Demo — Production Handover Document

> **Purpose**: This document provides context for building a production-ready application demonstrating gas sponsorship on an EVM blockchain where the native gas token is BTC. This is a complete product, not just a prototype.

---

## 1. Project Overview

### What Is This?

A **production-ready application** demonstrating gas sponsorship on an EVM blockchain where the native gas token is BTC. It provides developers with a complete, working example of:

1. Connecting a wallet (wagmi/viem integration)
2. Checking sponsorship eligibility via API
3. Building a sponsored transaction (UserOp) with paymaster data
4. Signing and submitting via a paymaster service
5. Observing on-chain confirmation with real-time updates

### Target Audience

Developers integrating with a gas sponsorship API (paymaster service) on Alpen Testnet or similar BTC-gas EVM chains who need a reference implementation.

### Current State

- ✅ **Frontend**: Fully functional React/TypeScript UI with all states visualized
- ✅ **State Management**: Complete state machine for wallet, sponsorship, and transaction flows
- ✅ **Backend API Structure**: Hono-based API with OpenAPI documentation
- ⚠️ **Backend Implementation**: API endpoints need to be implemented (currently using mock data)
- ⚠️ **Wallet Integration**: Needs wagmi/viem integration for real wallet connections
- ⚠️ **Tests**: Minimal coverage - needs comprehensive test suite
- ⚠️ **Real Blockchain Integration**: RPC calls and contract interactions need implementation

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | React 18 + Vite |
| **Backend Framework** | Hono (OpenAPI) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State Management** | React hooks (custom hooks pattern) |
| **Wallet Integration** | wagmi + viem (to be implemented) |
| **Routing** | react-router-dom v6 |
| **Testing** | Vitest + React Testing Library |
| **Build** | Vite |
| **API Documentation** | OpenAPI/Swagger (via Hono) |

### Project Structure

```
packages/
├── ui/                          # Frontend React application
│   └── src/
│       ├── pages/               # Page components
│       ├── components/          # UI components (presentation only)
│       ├── hooks/               # Custom hooks (business logic)
│       ├── lib/                 # Utilities and API clients
│       └── types/               # TypeScript type definitions
│
└── api/                         # Backend Hono API
    └── src/
        ├── routes/              # API route handlers
        │   ├── [route]/
        │   │   ├── [route].handler.ts    # Route handlers (controllers)
        │   │   ├── [route].routes.ts     # OpenAPI route definitions
        │   │   └── [route].index.ts      # Route registration
        ├── infra/               # Infrastructure services (external APIs, blockchain)
        ├── lib/                 # Shared utilities and types
        └── middlewares/         # Hono middlewares
```

### Key Files

**Frontend:**
```
src/
├── pages/Index.tsx              # Main page layout
├── hooks/
│   ├── useDemoState.ts          # Central state machine (needs refactoring)
│   ├── useWallet.ts             # Wallet connection hook (to be created)
│   ├── useSponsorship.ts        # Sponsorship logic hook (to be created)
│   └── useTransaction.ts        # Transaction flow hook (to be created)
├── lib/
│   └── api-client.ts            # API client for backend calls (to be created)
├── types/demo.ts                # Type definitions & constants
└── components/
    ├── CounterCard.tsx          # Counter display + increment button
    ├── GasStatusCard.tsx        # Sponsorship status + eligibility
    ├── DeveloperPanel.tsx       # API trace viewer
    ├── TopBar.tsx               # Header with wallet info
    ├── WalletSignatureModal.tsx # Signature request modal
    ├── PolicyModal.tsx          # Sponsorship policy display
    ├── HelpModal.tsx            # User guide
    └── DemoControls.tsx         # Dev controls (hide in production)
```

**Backend:**
```
src/
├── routes/
│   ├── wallet/
│   │   ├── wallet.handler.ts    # Wallet endpoints (to be created)
│   │   ├── wallet.routes.ts     # OpenAPI definitions
│   │   └── wallet.index.ts      # Route registration
│   ├── sponsor/
│   │   ├── sponsor.handler.ts  # Sponsorship endpoints (to be created)
│   │   ├── sponsor.routes.ts
│   │   └── sponsor.index.ts
│   └── counter/
│       ├── counter.handler.ts   # Counter contract endpoints (to be created)
│       ├── counter.routes.ts
│       └── counter.index.ts
├── infra/
│   ├── blockchain/
│   │   ├── rpc-client.ts        # RPC client service (to be created)
│   │   └── contract-service.ts  # Contract interaction service (to be created)
│   └── paymaster/
│       └── paymaster-service.ts # Paymaster API service (to be created)
└── lib/
    ├── types.ts                 # Shared types
    └── create-app.ts            # Hono app factory
```

---

## 3. State Machine Architecture

### Core State Types

```typescript
// src/types/demo.ts

type WalletStatus = 'disconnected' | 'connecting' | 'connected' | 'wrong-network';

type SponsorshipStatus = 
  | 'unchecked' | 'checking' | 'eligible' 
  | 'cooldown' | 'daily-limit' | 'policy-deny' | 'service-down';

type TransactionStatus = 
  | 'idle' | 'preparing' | 'awaiting-signature' 
  | 'pending' | 'success' | 'rejected' | 'failed';
```

### State Flow

```
[Disconnected] → Connect → [Connecting] → [Connected]
                                              ↓
                              Request Sponsorship
                                              ↓
[Unchecked] → [Checking] → [Eligible] ←→ [Cooldown]
                              ↓
                         Increment
                              ↓
[Idle] → [Preparing] → [Awaiting Signature] → [Pending] → [Success]
                              ↓
                          [Rejected]
```

### Configuration Constants

```typescript
// src/types/demo.ts
export const CONFIG = {
  chainName: 'Alpen Testnet',
  chainId: 8150,
  counterContract: '0x1588967e1635F4aD686cB67EbfDCc1D0A89191Ca',
  cooldownDuration: 60,  // seconds
  dailyLimit: 5,
} as const;
```

---

## 4. Backend API Requirements

### API Endpoints to Implement

| Method | Endpoint | Purpose | Handler Location |
|--------|----------|---------|------------------|
| `GET` | `/api/wallet/{address}/gas-balance` | Fetch wallet's native BTC gas balance | `routes/wallet/wallet.handler.ts` |
| `POST` | `/api/sponsor/eligibility` | Check if address is eligible for sponsorship | `routes/sponsor/sponsor.handler.ts` |
| `POST` | `/api/sponsor/build` | Build UserOp with paymaster data | `routes/sponsor/sponsor.handler.ts` |
| `POST` | `/api/sponsor/submit` | Submit signed UserOp to bundler | `routes/sponsor/sponsor.handler.ts` |
| `GET` | `/api/counter/state` | Read current counter value from chain | `routes/counter/counter.handler.ts` |

### Implementation Pattern

All endpoints should follow the architecture pattern:
1. **Handler** (controller): Validates input, calls service, returns response
2. **Service** (infra layer): Handles external API calls and business logic
3. **Types**: Shared TypeScript interfaces for requests/responses

See `ARCHITECTURE_RULES.md` for detailed implementation guidelines.

### Request/Response Schemas

#### Eligibility Request
```typescript
{
  address: string;
  chainId: number;
  contract: string;
  function: string;
}
```

#### Eligibility Response
```typescript
{
  eligible: boolean;
  reason: string | null;  // "cooldown", "daily-limit", "policy-deny", etc.
  cooldownSeconds: number;
  dailyRemaining: number;
  globalBudgetOk: boolean;
}
```

#### Build Request
```typescript
{
  address: string;
  callData: string;
  nonceHint?: number;
}
```

#### Build Response
```typescript
{
  userOp: {
    sender: string;
    nonce: string;
    callData: string;
    callGasLimit: string;
    // ... other ERC-4337 UserOp fields
  };
  paymasterAndData: string;
  sponsorshipId: string;
}
```

#### Submit Request
```typescript
{
  sponsorshipId: string;
  signedUserOp: {
    signature: string;
    // ... other signed UserOp fields
  };
}
```

#### Submit Response
```typescript
{
  status: 'submitted' | 'failed';
  txHash?: string;
  explorerUrl?: string;
  error?: string;
}
```

---

## 5. Frontend Architecture

### Component Principles

- **Single Responsibility**: Components handle only UI rendering
- **No Business Logic**: All logic in custom hooks
- **Presentation Only**: Components receive data and callbacks via props

### Custom Hooks Pattern

Business logic should be split into focused hooks:

1. **`useWallet`**: Wallet connection, address, balance, network
2. **`useSponsorship`**: Eligibility checking, cooldown management
3. **`useTransaction`**: Transaction building, signing, submission
4. **`useCounter`**: Counter state reading and updates

Each hook should:
- Manage its own state (loading, error, data)
- Expose functions and state via return object
- Handle errors appropriately
- Use the API client for backend calls

### API Client

Create `src/lib/api-client.ts` to centralize all backend API calls:

```typescript
// Example structure
export const apiClient = {
  wallet: {
    getGasBalance: (address: string) => Promise<GasBalanceResponse>
  },
  sponsor: {
    checkEligibility: (params: EligibilityRequest) => Promise<EligibilityResponse>,
    buildUserOp: (params: BuildRequest) => Promise<BuildResponse>,
    submitUserOp: (params: SubmitRequest) => Promise<SubmitResponse>
  },
  counter: {
    getState: (contract: string) => Promise<CounterStateResponse>
  }
}
```

### Wallet Integration

Use wagmi + viem for wallet connections:

```typescript
// Example setup
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

const config = createConfig({
  chains: [alpenTestnet], // Configure Alpen Testnet
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'BTC-Gas Demo' }),
    // ... other connectors
  ],
  transports: {
    [alpenTestnet.id]: http(),
  },
})
```

---

## 6. Testing Requirements

### Test Coverage Goals

- **Unit Tests**: >80% coverage for hooks and services
- **Component Tests**: All user-facing components
- **Integration Tests**: Complete user flows
- **API Tests**: All endpoint handlers

### Test Structure

```
src/test/
├── unit/
│   ├── hooks/
│   │   ├── useWallet.test.ts
│   │   ├── useSponsorship.test.ts
│   │   └── useTransaction.test.ts
│   └── lib/
│       └── api-client.test.ts
├── components/
│   ├── CounterCard.test.tsx
│   ├── GasStatusCard.test.tsx
│   └── WalletSignatureModal.test.tsx
└── integration/
    ├── wallet-flow.test.ts
    └── transaction-flow.test.ts
```

### Key Test Scenarios

1. **Wallet Connection Flow**
   - Connect wallet successfully
   - Handle connection rejection
   - Handle wrong network
   - Disconnect wallet

2. **Sponsorship Flow**
   - Check eligibility (eligible, cooldown, daily-limit, policy-deny)
   - Cooldown timer decrement
   - Daily limit tracking

3. **Transaction Flow**
   - Build UserOp
   - Sign transaction
   - Submit to bundler
   - Handle success/failure
   - Update counter state

4. **Error Handling**
   - Network errors
   - API errors
   - User rejection
   - Service unavailable

### Running Tests

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# Coverage report
bun run test:coverage
```

---

## 7. Production Readiness Checklist

### High Priority (MVP)

- [ ] Implement all backend API endpoints
- [ ] Create infrastructure services (RPC client, paymaster service, contract service)
- [ ] Integrate wagmi/viem for wallet connections
- [ ] Replace mock data with real API calls
- [ ] Connect to Alpen Testnet RPC
- [ ] Implement real counter contract reads
- [ ] Add error boundaries and fallback UI
- [ ] Add comprehensive error handling
- [ ] Write unit tests for hooks (>80% coverage)
- [ ] Write component tests

### Medium Priority

- [ ] Add integration tests for complete flows
- [ ] Implement retry logic for failed API calls
- [ ] Add loading skeletons during data fetches
- [ ] Implement WebSocket for real-time tx confirmations
- [ ] Add request/response logging (API trace)
- [ ] Refactor `useDemoState` into smaller hooks
- [ ] Add environment variable validation
- [ ] Add API rate limiting
- [ ] Add request validation middleware

### Low Priority

- [ ] Optimize bundle size
- [ ] Add PWA support
- [ ] Implement dark/light theme toggle (if not already)
- [ ] Add analytics/telemetry
- [ ] Performance monitoring
- [ ] Add i18n support
- [ ] Add E2E tests with Playwright

---

## 8. Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
VITE_ALPEN_RPC_URL=https://rpc.alpen.dev
VITE_COUNTER_CONTRACT=0x1588967e1635F4aD686cB67EbfDCc1D0A89191Ca
VITE_CHAIN_ID=8150
VITE_EXPLORER_URL=https://explorer.testnet.alpenlabs.io
```

### Backend (.env)

```env
PORT=3000
CORS_ORIGINS=http://localhost:5173,https://your-domain.com
ALPEN_RPC_URL=https://rpc.alpen.dev
COUNTER_CONTRACT=0x1588967e1635F4aD686cB67EbfDCc1D0A89191Ca
PAYMASTER_API_URL=https://sponsor.alpen.dev/api
PAYMASTER_API_KEY=your-api-key
CHAIN_ID=8150
```

---

## 9. Key Implementation Notes

### State Management Refactoring

The current `useDemoState.ts` (393 lines) should be split into:

1. **`useWallet.ts`**: Wallet connection, address, balance
2. **`useSponsorship.ts`**: Eligibility checking, cooldown management
3. **`useTransaction.ts`**: Transaction building, signing, submission
4. **`useCounter.ts`**: Counter state and updates

Each hook should be independent and composable.

### Cooldown Timer

The cooldown timer logic should remain in `useSponsorship` hook:

```typescript
useEffect(() => {
  if (status === 'cooldown' && cooldownSeconds > 0) {
    const interval = setInterval(() => {
      // Decrement and update state
    }, 1000);
    return () => clearInterval(interval);
  }
}, [status, cooldownSeconds]);
```

### API Trace

Maintain API trace logging for debugging. Consider:
- Only in development mode
- Or behind a feature flag
- Or in a dedicated debug panel

### Demo Controls

`DemoControls.tsx` should be:
- Hidden in production: `{!import.meta.env.PROD && <DemoControls />}`
- Or moved to a debug route: `/debug/controls`

---

## 10. Development Workflow

### Setup

```bash
# Install dependencies
bun install

# Start backend API
cd packages/api
bun run dev

# Start frontend (in another terminal)
cd packages/ui
bun run dev
```

### Code Organization

Follow the architecture rules in `ARCHITECTURE_RULES.md`:

1. **Backend**: Controllers → Services → External APIs
2. **Frontend**: Components → Hooks → API Client → Backend
3. **No direct external API calls** from components or controllers

### First Implementation Tasks

1. **Backend Infrastructure**
   - Create `infra/blockchain/rpc-client.ts`
   - Create `infra/blockchain/contract-service.ts`
   - Create `infra/paymaster/paymaster-service.ts`

2. **Backend Routes**
   - Implement `routes/wallet/wallet.handler.ts`
   - Implement `routes/sponsor/sponsor.handler.ts`
   - Implement `routes/counter/counter.handler.ts`

3. **Frontend API Client**
   - Create `lib/api-client.ts` with all API methods

4. **Frontend Hooks**
   - Refactor `useDemoState` into smaller hooks
   - Create `useWallet` with wagmi integration
   - Update components to use new hooks

5. **Testing**
   - Write unit tests for hooks
   - Write component tests
   - Write integration tests

---

## 11. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Components (Presentation Only)             │ │
│  │  CounterCard | GasStatusCard | TopBar | Modals         │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Custom Hooks (Business Logic)             │ │
│  │  useWallet | useSponsorship | useTransaction           │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  API Client (lib/api-client.ts)        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Hono API)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Route Handlers (Controllers)               │ │
│  │  wallet.handler | sponsor.handler | counter.handler    │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│                          ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Infrastructure Services (infra/)                │ │
│  │  RPC Client | Contract Service | Paymaster Service     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  ┌──────────┐    ┌──────────────┐    ┌──────────┐
  │  Alpen   │    │   Paymaster  │    │ Contract │
  │   RPC    │    │     API      │    │  (Chain) │
  └──────────┘    └──────────────┘    └──────────┘
```

---

## 12. Resources & References

- **Live Preview**: https://id-preview--d825e530-ceab-4c81-af80-164ffd3d244c.lovable.app
- **Published URL**: https://alp-gas-abstraction.lovable.app
- **Chain Explorer**: https://explorer.testnet.alpenlabs.io
- **Faucet**: https://faucet.testnet.alpenlabs.io
- **wagmi Documentation**: https://wagmi.sh
- **Hono Documentation**: https://hono.dev
- **ERC-4337 Specification**: https://eips.ethereum.org/EIPS/eip-4337

---

## 13. Architecture Rules

See `ARCHITECTURE_RULES.md` for detailed coding standards, patterns, and examples specific to this project.

---

*Last updated: 2026-02-04*
