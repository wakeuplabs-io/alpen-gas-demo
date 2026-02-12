import { PrivyProvider } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { CHAIN } from './lib/network';
import { env } from './config/env';
import { ApiTraceProvider, useApiTrace } from './contexts/api-trace-context';
import { setApiTraceCallback } from './infra/api/client';
import { setContractTraceCallback } from './infra/contracts/traced-contract';
import { setProviderTraceCallback } from './infra/contracts/traced-provider';

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

function ApiTraceInitializer({ children }: { children: ReactNode }) {
  const { addTrace } = useApiTrace();

  useEffect(() => {
    setApiTraceCallback(addTrace);
    setContractTraceCallback(addTrace);
    setProviderTraceCallback(addTrace);
  }, [addTrace]);

  return <>{children}</>;
}

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
        <ApiTraceProvider>
          <ApiTraceInitializer>
            {children}
          </ApiTraceInitializer>
        </ApiTraceProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
}
