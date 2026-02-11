import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            How Sponsorship Works
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            This demo shows how a dapp can sponsor gas fees for users who don't have the native gas token (BTC on this chain) using EIP-7702 delegation.
          </p>

          {/* Flow Diagram */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium mb-3">Sponsorship Flow</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">1</div>
                <div>
                  <span className="font-medium">Connect Wallet</span>
                  <p className="text-muted-foreground text-xs">User connects wallet via Privy and frontend detects 0 BTC balance</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">2</div>
                <div>
                  <span className="font-medium">Check Eligibility</span>
                  <p className="text-muted-foreground text-xs">Backend queries SponsorWhitelist contract (daily limit, allowlist, global cap)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">3</div>
                <div>
                  <span className="font-medium">Setup Delegation</span>
                  <p className="text-muted-foreground text-xs">User signs EIP-7702 authorization, backend submits type-4 transaction to activate delegation</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">4</div>
                <div>
                  <span className="font-medium">Sign Transaction</span>
                  <p className="text-muted-foreground text-xs">User signs transaction digest via Privy</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">5</div>
                <div>
                  <span className="font-medium">Execute & Sponsor</span>
                  <p className="text-muted-foreground text-xs">Backend calls execute() on delegated contract, BatchCallAndSponsor validates and pays gas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Concepts</h4>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>
                <strong className="text-foreground">EIP-7702 Delegation:</strong> Allows an EOA to temporarily delegate its code to a smart contract implementation.
              </p>
              <p>
                <strong className="text-foreground">BatchCallAndSponsor:</strong> The delegated contract that executes batched calls and validates sponsorship eligibility before paying gas fees.
              </p>
              <p>
                <strong className="text-foreground">SponsorWhitelist:</strong> Smart contract that enforces sponsorship policy (daily limits, allowed contracts, global caps) to prevent abuse.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
