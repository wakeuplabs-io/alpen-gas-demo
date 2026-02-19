import { useEffect, useRef } from "react";
import { useWallet } from "./use-wallet";
import { useDelegate } from "./use-delegate";
import { env } from "@/config/env";
import { WalletStatus } from "@/types/wallet";

/**
 * Automatically sets up delegation when wallet is connected
 * Runs in the background and doesn't block the UI
 */
export function useAutoDelegate() {
  const { operationalAddress, status } = useWallet();
  const { setupDelegate } = useDelegate();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (!operationalAddress) {
      hasAttemptedRef.current = false;
      return;
    }

    // Wait for wallet to be fully connected before attempting delegation
    if (status !== WalletStatus.CONNECTED) {
      hasAttemptedRef.current = false;
      return;
    }

    // Prevent multiple simultaneous attempts
    if (hasAttemptedRef.current) {
      return;
    }

    const setup = async () => {
      try {
        hasAttemptedRef.current = true;

        await setupDelegate({ 
          implementation: env.batchCallAndSponsorAddress 
        });

      } catch (err) {
        console.error("Auto-delegation failed:", err);
        hasAttemptedRef.current = false;
      }
    };

    setup();
  }, [status, operationalAddress, setupDelegate]);
}
