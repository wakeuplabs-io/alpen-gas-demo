import { Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function ConnectWalletButton() {
  const { isConnected } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  if (isConnected) {
    return null;
  }

  return (
    <Button
      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={openConnectModal}
      disabled={connectModalOpen}
    >
      {connectModalOpen ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
