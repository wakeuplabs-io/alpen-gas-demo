import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { CHAIN } from './lib/network';
import { env } from './config/env';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PrivyProvider
      appId={env.privyAppId || ''}
      clientId={env.privyClientId || ''}
      config={{
        // Automatically create embedded wallet for all users
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'all-users',
          },
        },
        // Configure Alpen Testnet
        supportedChains: [CHAIN],
        defaultChain: { ...CHAIN },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
