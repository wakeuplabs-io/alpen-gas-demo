# BTC-Gas EVM Counter Demo

> Application demonstrating gas sponsorship on Alpen blockchain where the native gas token is BTC.

## Overview

This monorepo contains a full-stack application for demonstrating gas sponsorship on the Alpen blockchain. It consists of three main packages:

- **`packages/api`** - Backend API built with Hono
- **`packages/ui`** - Frontend React application
- **`packages/contracts`** - Smart contracts built with Foundry

## Technologies

### Backend (`packages/api`)
- **Framework**: [Hono](https://hono.dev/) - Fast web framework
- **Language**: TypeScript
- **Libraries**: 
  - `ethers` / `viem` - Blockchain interaction
  - `zod` - Schema validation

### Frontend (`packages/ui`)
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Wallet**: [Privy](https://privy.io/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)

### Smart Contracts (`packages/contracts`)
- **Framework**: [Foundry](https://book.getfoundry.sh/)
- **Language**: Solidity 0.8.27
- **EVM Version**: Cancun

### Package-Specific READMEs

Each package has its own README with setup instructions:

- **[`packages/api/README.md`](./packages/api/README.md)** - Backend API setup and development
- **[`packages/ui/README.md`](./packages/ui/README.md)** - Frontend application setup and development
- **[`packages/contracts/README.md`](./packages/contracts/README.md)** - Smart contracts setup and development

## Quick Start Setup

### Setup Sequence

For end-to-end testing and local development, follow this sequence:

1. **Deploy Smart Contracts** (see [`packages/contracts/README.md`](./packages/contracts/README.md))
   - Deploy `BatchCallAndSponsor` and `SponsorWhitelist` contracts
   - Deploy `Counter` contract
   - Add `Counter` to the `SponsorWhitelist` allow list
   - Save all deployed contract addresses
   - **Test contracts (dry-run)**: Run `./script/test-contracts.sh` to verify contracts work before proceeding

2. **Configure Backend API** (see [`packages/api/README.md`](./packages/api/README.md))
   - Copy `packages/api/.env.example` to `packages/api/.env`
   - Set `RPC_URL` to your Alpen RPC endpoint
   - Set `SPONSOR_PRIVATE_KEY` with your sponsor wallet private key
   - Set `BATCH_CALL_AND_SPONSOR_ADDRESS` and `SPONSOR_WHITELIST_ADDRESS` from step 1
   - Start the API server: `cd packages/api && npm run dev`

3. **Configure Frontend UI** (see [`packages/ui/README.md`](./packages/ui/README.md))
   - Copy `packages/ui/.env.example` to `packages/ui/.env`
   - Set `VITE_API_URL` to match your API server (default: `http://localhost:9999`)
   - Set `VITE_COUNTER_CONTRACT_ADDRESS`, `VITE_BATCH_CALL_AND_SPONSOR_ADDRESS`, and `VITE_SPONSOR_WHITELIST_ADDRESS` from step 1
   - Configure Privy wallet credentials (`VITE_PRIVY_APP_ID`, `VITE_PRIVY_CLIENT_ID`)
   - Start the UI: `cd packages/ui && npm run dev`

4. **Run Smoke Tests** (optional but recommended)
   - Run `npm run test:smoke` from the root directory to verify all components are connected
   - This checks backend API, contract connectivity, and basic configuration

### Running Everything Together

```bash
# From the root directory, start both API and UI
npm run dev
```

This will start:
- API server on `http://localhost:9999`
- UI application on `http://localhost:3000`

## Technical Documentation

For detailed architecture, design decisions, and implementation details:

- **[`packages/documentation/architecture-and-design.md`](./packages/documentation/architecture-and-design.md)** - Complete technical documentation including:
  - System architecture and component interactions
  - EIP-7702 delegation flow with sequence diagrams
  - Smart contracts design and responsibilities
  - Security considerations and best practices
  - Wallet integration details and alternatives
