import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { CounterCard } from '@/components/CounterCard';
import { GasStatusCard } from '@/components/GasStatusCard';
import { DeveloperPanel } from '@/components/DeveloperPanel';
import { WalletSignatureModal } from '@/components/WalletSignatureModal';
import { PolicyModal } from '@/components/PolicyModal';
import { HelpModal } from '@/components/HelpModal';
import { DemoControls } from '@/components/DemoControls';
import { useDemoState } from '@/hooks/useDemoState';
import { toast } from 'sonner';
import { useDisconnect, useSwitchChain } from 'wagmi';
import { useWallet } from '@/hooks/use-wallet';
import { ChainId } from '@/types/chain';

const Index = () => {
  const { state, actions } = useDemoState();
  const [showPolicy, setShowPolicy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const wallet = useWallet();

  const handleSwitchNetwork = () => {
    switchChain(
      { chainId: ChainId.ALPEN_TESTNET },
      {
        onSuccess: () => {
          toast.success('Network switched successfully', {
            description: 'You are now connected to Alpen Testnet.',
          });
        },
        onError: (error) => {
          toast.error('Failed to switch network', {
            description: error.message || 'Please switch the network manually in your wallet.',
          });
        },
      }
    );
  };


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        wallet={wallet}
        onHelpClick={() => setShowHelp(true)}
        onDisconnect={disconnect}
      />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6 h-full">
          {/* Left Column - User Actions */}
          <div className="space-y-6">
            <CounterCard
              counter={state.counter}
              wallet={wallet}
              sponsorship={state.sponsorship}
              transaction={state.transaction}
              onIncrement={actions.incrementCounter}
              onRefresh={actions.refreshCounter}
            />

            <GasStatusCard
              wallet={wallet}
              sponsorship={state.sponsorship}
              onRequestSponsorship={actions.checkSponsorship}
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
        onForceTransactionStatus={actions.forceTransactionStatus}
        onReset={actions.resetDemo}
      />
    </div>
  );
};

export default Index;
