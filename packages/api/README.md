# API Package

Backend API built with Hono for handling gas sponsorship operations on the Alpen blockchain.

## Technologies

- **Framework**: Hono 4.7.4
- **Runtime**: Node.js 18.18.2
- **Language**: TypeScript
- **Deployment**: AWS Lambda (via SST)
- **Key Libraries**:
  - `ethers` / `viem` - Blockchain interaction
  - `zod` - Schema validation
  - `pino` - Structured logging
  - `@hono/zod-openapi` - OpenAPI integration

## Local Development Setup

### Step 1: Install Dependencies

```bash
cd packages/api
npm install
```

### Step 2: Create Environment File

Create a `.env` file in `packages/api/`:

```bash
cp .env.example .env
```

### Step 3: Configure Environment Variables

Edit the `.env` file and fill in the required values. See `.env.sample` for the complete list of variables:

```env
NODE_ENV=development
PORT=5001
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:3000
RPC_URL=https://rpc.testnet.alpenlabs.io

SPONSOR_PRIVATE_KEY=0x
BATCH_CALL_AND_SPONSOR_ADDRESS=0x
SPONSOR_WHITELIST_ADDRESS=0x
```

> **Note**: Make sure to deploy contracts first (see [`packages/contracts/README.md`](../contracts/README.md)) and use the deployed addresses for `BATCH_CALL_AND_SPONSOR_ADDRESS` and `SPONSOR_WHITELIST_ADDRESS`.

**Required Variables:**
- `RPC_URL` - Alpen blockchain RPC endpoint
- `SPONSOR_PRIVATE_KEY` - **Sponsor wallet private key** - This is the wallet that pays for gas when sponsoring transactions. This is different from contract owners (see note below).
- `BATCH_CALL_AND_SPONSOR_ADDRESS` - Deployed BatchCallAndSponsor contract address

**Optional Variables:**
- `PORT` - Server port (default: 9999)
- `LOG_LEVEL` - Logging level (default: info)
- `CORS_ORIGINS` - Allowed CORS origins (default: http://localhost:3000)
- `SPONSOR_WHITELIST_ADDRESS` - SponsorWhitelist contract address

> **Important: Understanding Sponsor Wallet vs Contract Owners**
> 
> - **`SPONSOR_PRIVATE_KEY`** (Sponsor Wallet): This is the wallet that **pays for gas** when sponsoring user transactions. The backend uses this wallet to submit sponsored transactions on behalf of users. This wallet needs to have BTC balance to pay for gas.
> 
> - **Contract Owners**: The `SponsorWhitelist` contract has an `owner` (set during deployment) who can modify the whitelist, change daily limits, etc. This is a separate concept from the sponsor wallet.
> 
> - **`BatchCallAndSponsor`**: This is a contract that executes batched calls and validates sponsorship through the `SponsorWhitelist`. It doesn't have an owner - it's immutable after deployment.
> 
> In summary: The sponsor wallet pays gas, contract owners manage contract settings, and they are independent of each other.

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:9999` (or your configured PORT).

### Step 5: Verify Setup

Check that the API is running correctly:

```bash
# Health check endpoint
curl http://localhost:9999/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "btc-gas-api",
  "version": "1.0.0"
}
```

You can also access:
- **API Documentation**: http://localhost:9999/reference
- **REST API**: http://localhost:9999/api

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

## API Endpoints

The API provides the following endpoints:

### Health Check

- **GET** `/api/health` - Health check endpoint
  - Returns the current health status of the API
  - Response: `{ status: "ok", timestamp: string, service: string, version?: string }`

### Sponsor Routes

- **POST** `/api/sponsor/request` - Check sponsorship eligibility
  - Validates if a wallet address is eligible for gas sponsorship

### Delegate Routes

- Delegate-related endpoints (see API documentation for details)

### API Documentation

When the server is running, you can access:
- **OpenAPI Reference**: http://localhost:9999/reference
- **REST API Base**: http://localhost:9999/api

## Project Structure

```
packages/api/
├── src/
│   ├── app.ts              # Main Hono app
│   ├── index.ts            # Entry point
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── routes/             # API routes
│   │   ├── index.route.ts  # Health check endpoint
│   │   ├── sponsor/        # Sponsor endpoints
│   │   └── delegate/       # Delegate endpoints
│   ├── infra/              # Infrastructure services
│   │   └── contracts/      # Contract interactions
│   ├── lib/                # Shared utilities
│   └── middlewares/        # Hono middlewares
└── package.json
```

