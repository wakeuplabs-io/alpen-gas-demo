import { useState } from 'react';
import { toast } from 'sonner';
import { useLogout, useWallets } from '@privy-io/react-auth';

import { TopBar } from '@/components/TopBar';
import { CounterCard } from '@/components/CounterCard';
import { GasStatusCard } from '@/components/GasStatusCard';
import { DeveloperPanel } from '@/components/DeveloperPanel';
import { WalletSignatureModal } from '@/components/WalletSignatureModal';
import { PolicyModal } from '@/components/PolicyModal';
import { HelpModal } from '@/components/HelpModal';
import { DemoControls } from '@/components/DemoControls';

import { useDemoState } from '@/hooks/useDemoState';
import { useWallet } from '@/hooks/use-wallet';
import { useCounter } from '@/hooks/use-counter';
import { useSponsorship } from '@/hooks/use-sponsorship';

import { TransactionStatus } from '@/types/transaction';

import { CHAIN_ID } from '@/lib/network';

const Index = () => {
  // States
  const { state, actions } = useDemoState();
  const [showPolicy, setShowPolicy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Hooks
  const { logout } = useLogout();
  const { wallets } = useWallets();
  const wallet = useWallet();
  const counter = useCounter();
  const { sponsorship, checkEligibility } = useSponsorship();
  

  const handleSwitchNetwork = async () => {
    try {
      // Privy handles chain switching automatically for embedded wallets
      // For external wallets, we can try to switch
      if (wallets && wallets.length > 0) {
        // Try to switch chain if supported
        await wallets[0].switchChain(CHAIN_ID);
        toast.success('Network switched successfully', {
          description: 'You are now connected to Alpen Testnet.',
        });
      }
    } catch (error) {
      toast.error('Failed to switch network', {
        description: error instanceof Error ? error.message : 'Please switch the network manually in your wallet.',
      });
    }
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        wallet={wallet}
        onHelpClick={() => setShowHelp(true)}
        onDisconnect={logout}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          {/* Left Column - User Actions */}
          <div className="space-y-6">
            <CounterCard
              counter={counter}
              wallet={wallet}
              sponsorship={sponsorship}
              transaction={counter.transaction}
              onIncrement={counter.increment}
              onRefresh={actions.refreshCounter}
            />

            <GasStatusCard
              wallet={wallet}
              sponsorship={sponsorship}
              onRequestSponsorship={checkEligibility}
              onViewPolicy={() => setShowPolicy(true)}
              onSwitchNetwork={handleSwitchNetwork}
            />
          </div>

          {/* Right Column - Developer Panel */}
          <div className="lg:h-[calc(100vh-8rem)]">
            <DeveloperPanel apiTrace={state.apiTrace} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <WalletSignatureModal
        open={state.transaction.status === 'awaiting-signature'}
        onSign={actions.signTransaction}
        onReject={actions.rejectTransaction}
      />

      <PolicyModal
        sponsorship={sponsorship}
        open={showPolicy}
        onClose={() => setShowPolicy(false)}
      />

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Demo Controls */}
      <DemoControls
        onForceWalletStatus={actions.forceWalletStatus}
        onForceSponsorshipStatus={actions.forceSponsorshipStatus}
        onForceTransactionStatus={(status) => actions.forceTransactionStatus(status as TransactionStatus)}
        onReset={actions.resetDemo}
      />
    </div>
  );
};

export default Index;
