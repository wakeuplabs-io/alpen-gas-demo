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

import { useWallet } from '@/hooks/use-wallet';
import { useCounter } from '@/hooks/use-counter';
import { useSponsorship } from '@/hooks/use-sponsorship';
import { useLastEvent } from '@/hooks/use-last-event';
import { useTransaction } from '@/hooks/use-transaction';

import { TransactionStatus } from '@/types/transaction';
import { Address } from '@/types/wallet';

import { CHAIN_ID } from '@/lib/network';

const Index = () => {
  // States
  const [showPolicy, setShowPolicy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Hooks
  const { logout } = useLogout();
  const { wallets } = useWallets();
  const wallet = useWallet();
  const counter = useCounter();
  const { state: transaction, actions: transactionActions } = useTransaction();
  const { sponsorship, checkEligibility } = useSponsorship();
  const { lastEvent } = useLastEvent();
  

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

  const handleSignTransaction = async () => {
    const signature = await transactionActions.signTransaction();
    await transactionActions.transactTransaction(signature);
  }


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
              count={counter.count}
              lastEvent={lastEvent}
              wallet={wallet}
              sponsorship={sponsorship}
              transaction={transaction}
              onIncrement={transactionActions.startTransaction}
              onRefresh={() => {}}
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
            <DeveloperPanel />
          </div>
        </div>
      </main>

      {/* Modals */}
      <PolicyModal
        sponsorship={sponsorship}
        open={showPolicy}
        onClose={() => setShowPolicy(false)}
      />

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <WalletSignatureModal 
        wallet={wallet.address as Address}
        open={transaction.status === TransactionStatus.AWAITING_SIGNATURE}
        isLoading={transaction.status === TransactionStatus.PENDING}
        onSign={handleSignTransaction}
        onReject={transactionActions.resetTransaction}
      />

    </div>
  );
};

export default Index;
