import { usePrivy, useUser, useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { PROVIDER } from "@/lib/network";
import { Wallet } from "@/types/wallet";
import {
  getWalletsAddresses,
  getWalletStatus,
} from "@/lib/wallet";

export function useWallet() {
  const { ready, authenticated } = usePrivy();
  const { user } = useUser();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string>('0');

  const [address, operationalAddress] = getWalletsAddresses(user);

  useEffect(() => {
    if (address) {
      PROVIDER.getBalance(address).then((bal) => {
        setBalance(bal.toString());
      });
    }
  }, [operationalAddress]);

  return {
    status: getWalletStatus(ready, authenticated, address, wallets?.[0]?.chainId),
    address,
    operationalAddress,
    balance,
  } satisfies Wallet;
} 