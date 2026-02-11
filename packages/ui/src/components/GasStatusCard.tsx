import { AlertTriangle, Shield, Loader2, Check, XCircle, WifiOff, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet } from "@/types/wallet";
import { SponsorshipState, SponsorshipStatus } from "@/types/sponsorship";
import { WalletStatus } from "@/types/wallet";
import { formatBalance } from "@/lib/balance";
import { CHAIN } from "@/lib/network";

interface GasStatusCardProps {
  wallet: Wallet;
  sponsorship: SponsorshipState;
  onRequestSponsorship: () => void;
  onViewPolicy: () => void;
  onSwitchNetwork: () => void;
}

export function GasStatusCard({
  wallet,
  sponsorship,
  onRequestSponsorship,
  onViewPolicy,
  onSwitchNetwork,
}: GasStatusCardProps) {
  const isConnected = wallet.status === WalletStatus.CONNECTED;
  const isWrongNetwork = wallet.status === WalletStatus.WRONG_NETWORK;

  if (!isConnected && !isWrongNetwork) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Tx Gas Sponsorship</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">Connect wallet to view gas sponsorship options</div>
        </CardContent>
      </Card>
    );
  }

  if (isWrongNetwork) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Wrong Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Please switch to <strong>{CHAIN.name}</strong> (Chain ID: {CHAIN.id}) to continue.
          </p>
          <Button onClick={onSwitchNetwork} className="w-full">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Switch Network
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Tx Gas Sponsorship</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gas Token Info */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network gas token:</span>
            <span className="font-medium text-primary">BTC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your balance:</span>
            <span className="font-mono">
              {formatBalance(wallet.balance)} BTC
              <span className="text-muted-foreground ml-1">({wallet.balance} sats)</span>
            </span>
          </div>
        </div>

        {/* Zero Balance Warning */}

        {Number(wallet.balance) === 0 && sponsorship.status === SponsorshipStatus.UNCHECKED && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-warning font-medium">No BTC for transaction fees</p>
              <p className="text-muted-foreground mt-0.5">
                You don't have BTC for transaction fees on {CHAIN.name}.
              </p>
            </div>
          </div>
        )}

        {/* Sponsorship Status */}
        <div className="space-y-3">
          {sponsorship.status === SponsorshipStatus.UNCHECKED && (
            <Button
              onClick={onRequestSponsorship}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Shield className="h-4 w-4 mr-2" />
              Request Gas Sponsorship
            </Button>
          )}

          {sponsorship.status === SponsorshipStatus.CHECKING && (
            <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking eligibility...</span>
            </div>
          )}

          {sponsorship.status === SponsorshipStatus.ELIGIBLE && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-3 slide-up">
              <div className="flex items-center gap-2 text-success mb-2">
                <Check className="h-4 w-4" />
                <span className="font-medium">Sponsorship Ready</span>
              </div>
              <p className="text-xs text-muted-foreground">
                You will sign a sponsored operation; gas is paid by the app's paymaster.
              </p>
            </div>
          )}

          {sponsorship.status === SponsorshipStatus.DAILY_LIMIT && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 slide-up">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Daily Limit Reached</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Daily sponsorship limit reached. Try again tomorrow or fund your wallet with BTC.
              </p>
            </div>
          )}

          {sponsorship.status === SponsorshipStatus.POLICY_DENY && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 slide-up">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Policy Denied</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                This operation is not covered by the sponsorship policy.
              </p>
              <Button variant="link" className="h-auto p-0 text-primary" onClick={onViewPolicy}>
                View policy →
              </Button>
            </div>
          )}

          {sponsorship.status === SponsorshipStatus.SERVICE_DOWN && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 slide-up">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">Service Unavailable</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Sponsorship service is temporarily unavailable. Please try again.
              </p>
              <Button variant="outline" size="sm" onClick={onRequestSponsorship} className="mt-1">
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Limits Display */}
        {isConnected && ([SponsorshipStatus.ELIGIBLE, SponsorshipStatus.CHECKING].includes(sponsorship.status)) && (
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Daily remaining:</span>
              <span className="font-mono">
                {sponsorship.dailyRemaining} / {sponsorship.dailyLimit}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Tooltip>
                <TooltipTrigger className="text-muted-foreground flex items-center gap-1 cursor-help">
                  Global usage:
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    The sponsorship system has a global spend cap to prevent abuse. The backend tracks total spending
                    across all users.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className="font-mono">
                {sponsorship.globalDailyUsage} / {sponsorship.globalDailyLimit}
              </span>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={onViewPolicy}
            >
              View full policy →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

