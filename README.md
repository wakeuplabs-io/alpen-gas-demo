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

