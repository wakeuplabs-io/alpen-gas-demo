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

## Privy Setup Guide

Privy is used for wallet authentication and connection. You need to obtain credentials from the Privy Dashboard to enable wallet functionality.

### Step 1: Create a Privy Account

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Sign up or log in with your account
3. You'll be redirected to your dashboard

### Step 2: Create a New App

1. In the Privy Dashboard, click **"Create App"** or **"New App"**
2. Fill in the app details:
   - **App Name**: Choose a name (e.g., "BTC-Gas Demo")
   - **Environment**: Select "Development" for local development
3. Click **"Create"**

### Step 3: Get Your Credentials

After creating your app, you'll see the app details page with your credentials:

1. **App ID** (`VITE_PRIVY_APP_ID`):
   - Located in the **"App ID"** field at the top of the app details page
   - Format: Usually a long string like `clxxxxxxxxxxxxxxxxxxxxx`
   - Copy this value

2. **Client ID** (`VITE_PRIVY_CLIENT_ID`):
   - Located in the **"Client ID"** field (may be in a "Settings" or "Configuration" section)
   - Format: Usually a string similar to the App ID
   - Copy this value

### Step 4: Configure Your App

1. **Configure Allowed Origins** (important for local development):
   - Go to **Settings** → **Allowed Origins**
   - Add your local development URL: `http://localhost:3000`
   - Add your production URL if applicable

2. **Configure Chain Settings** (optional):
   - Go to **Settings** → **Chains**
   - Ensure your target chain (Alpen Testnet) is configured
   - Privy supports custom RPC endpoints

3. **Configure Login Methods** (optional):
   - The app is configured to only allow wallet connections (email login is disabled)
   - This is set in the code via `loginMethods: ['wallet']` in `providers.tsx`
   - If you need to enable email login, you can modify this configuration

### Step 5: Add Credentials to Your `.env` File

Add the credentials you copied to your `packages/ui/.env` file:

```env
VITE_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxxxxx
VITE_PRIVY_CLIENT_ID=clxxxxxxxxxxxxxxxxxxxxx
```

### Step 6: Restart Development Server

After adding the credentials, restart your development server:

```bash
npm run dev
```

The warnings about missing Privy credentials should disappear, and wallet functionality will be fully enabled.

### Troubleshooting

**Issue: "Invalid App ID" or "Invalid Client ID"**
- Verify you copied the complete values (no extra spaces)
- Ensure you're using the correct environment (Development vs Production)
- Check that the credentials match the app in your Privy Dashboard

**Issue: Wallet connection not working**
- Verify `http://localhost:3000` is added to Allowed Origins in Privy Dashboard
- Check browser console for specific error messages
- Ensure you're using the correct App ID and Client ID for your environment

**Issue: Can't find Client ID**
- Some Privy setups may use App ID for both values
- Check the Privy documentation for your specific setup
- Contact Privy support if credentials are missing

### Additional Resources

- [Privy Dashboard](https://dashboard.privy.io/)
- [Privy Documentation](https://docs.privy.io/)
- [Privy React Auth Guide](https://docs.privy.io/guide/react)
