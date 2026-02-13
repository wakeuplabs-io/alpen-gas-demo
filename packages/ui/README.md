# UI Package

Frontend React application for interacting with the gas sponsorship system on the Alpen blockchain.

## Technologies

- **Framework**: React 19
- **Build Tool**: Vite 6.2.1
- **Language**: TypeScript
- **Routing**: TanStack Router
- **State Management**: TanStack Query
- **Wallet**: Privy
- **Styling**: TailwindCSS + DaisyUI
- **UI Components**: Radix UI

## Local Development Setup

### Step 1: Install Dependencies

```bash
cd packages/ui
npm install
```

### Step 2: Create Environment File

Create a `.env` file in `packages/ui/`:

```bash
cp .env.example .env  # If you have an example file
# Or create .env manually
```

### Step 3: Configure Environment Variables

Add the following variables to your `.env` file:

```env
VITE_API_URL=http://localhost:9999
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
VITE_COUNTER_CONTRACT=0x...
VITE_BATCH_CALL_AND_SPONSOR=0x...
VITE_SPONSOR_WHITELIST=0x...
```

> **Note**: `VITE_API_URL` should match the API server port. The default API port is 9999.

**Required Variables:**
- `VITE_COUNTER_CONTRACT` - Counter contract address (must be valid Ethereum address)
- `VITE_BATCH_CALL_AND_SPONSOR` - Batch call contract address (must be valid Ethereum address)
- `VITE_SPONSOR_WHITELIST` - Whitelist contract address (must be valid Ethereum address)
- `VITE_PRIVY_APP_ID` - Privy application ID (warns if not set)
- `VITE_PRIVY_CLIENT_ID` - Privy client ID (warns if not set)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000, should match API port)

### Step 4: Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3000`.

### Step 5: Verify Setup

Open your browser to `http://localhost:3000`. You should see the application interface.

## Project Structure

```
packages/ui/
├── src/
│   ├── main.tsx           # Application entry point
│   ├── App.tsx            # Root component
│   ├── providers.tsx      # React providers (Query, Router, etc.)
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── infra/             # Infrastructure services
│   │   └── counter-event-service.ts
│   ├── lib/               # Shared utilities
│   ├── types/             # TypeScript types
│   └── config/
│       └── env.ts         # Environment configuration
├── public/                # Static assets
└── package.json
```

## Wallet Authentication

The application uses Privy for wallet authentication. You need to configure `VITE_PRIVY_APP_ID` and `VITE_PRIVY_CLIENT_ID` in your `.env` file to enable wallet functionality. Obtain these credentials from your Privy account configuration.
