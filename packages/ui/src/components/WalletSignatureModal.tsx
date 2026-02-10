import { Shield, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { env } from '@/config/env';
import { CHAIN, EXPLORER_URL } from '@/lib/network';
import { Address } from '@/types/wallet';

interface WalletSignatureModalProps {
  open: boolean;
  wallet: Address;
  isLoading: boolean;
  onSign: () => Promise<void>;
  onReject: () => void;
}

export function WalletSignatureModal({
  open,
  wallet,
  isLoading,
  onSign,
  onReject,
}: WalletSignatureModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onReject()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Signature Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Wallet Mock Header */}
          <div className="bg-muted/50 rounded-lg p-3 border border-border">
            <div className="text-xs text-muted-foreground mb-1">External Wallet Request</div>
            <div className="font-mono text-sm truncate">
              {wallet}
            </div>
          </div>

          {/* Operation Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-start text-sm">
              <span className="text-muted-foreground">Signing:</span>
              <span className="font-mono text-right">
                UserOperation for<br />
                <span className="text-primary">Counter.increment()</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Gas paid by:</span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-success" />
                <span className="text-success font-medium">Sponsor Paymaster</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span>
                {CHAIN.name} ({CHAIN.id})
                <span className="text-muted-foreground ml-1">(gas in BTC)</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Contract:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-mono text-xs hover:bg-transparent"
                onClick={() => {
                  window.open(`${EXPLORER_URL}/address/${env.counterAddress}`, '_blank');
                }}
              >
                {env.counterAddress.slice(0, 6)}...{env.counterAddress.slice(-4)}
                <ExternalLink className="h-3 w-3 inline ml-1 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong className="text-primary">Note:</strong> This operation is sponsored. 
              You will not pay any gas fees for this transaction.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onReject}
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onSign}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                'Sign'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
