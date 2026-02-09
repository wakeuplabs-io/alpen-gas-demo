import { Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';

export function ConnectWalletButton() {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <Button
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        disabled
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <Button
      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={login}
    >
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
}
