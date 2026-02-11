import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { CHAIN } from './lib/network';
import { env } from './config/env';

interface ProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PrivyProvider
        appId={env.privyAppId || ''}
        clientId={env.privyClientId || ''}
        config={{
          // Only allow wallet connections, disable email login
          loginMethods: ['wallet'],
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
    </QueryClientProvider>
  );
}
