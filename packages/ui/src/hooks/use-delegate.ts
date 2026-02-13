import { keccak256, solidityPacked } from "ethers";
import { useSign7702Authorization, useSignMessage } from "@privy-io/react-auth";

import { CHAIN_ID, PROVIDER } from "@/lib/network";
import { isDelegatedToImplementation, getAccountCodeWithRetry, isDelegated } from "@/lib/delegation";

import { BATCH_CALL_AND_SPONSOR_ADDRESS } from "@/infra/contracts";
import { getContractNonce } from "@/infra/contracts/delegated";

import { useWallet } from "./use-wallet";
import { useDelegateSetup } from "./use-delegate-setup";
import { useDelegateTransact } from "./use-delegate-transact";

interface Call {
  to: string;
  value: string;
  data: string;
}


export function useDelegate() {
  const { operationalAddress: user } = useWallet();
  const { signMessage } = useSignMessage();
  const { signAuthorization } = useSign7702Authorization();
  const { mutateAsync: callDelegateSetup } = useDelegateSetup();
  const { mutateAsync: callDelegateTransact } = useDelegateTransact();

  const setupDelegate = async ({ implementation }: { implementation: string }) => {
    if (!user) {
      throw new Error("User address not found");
    }

    // Check if already delegated to the correct implementation (with retries)
    const isAlreadyDelegated = await isDelegatedToImplementation(user, implementation);
    if (isAlreadyDelegated) {
      return;
    }

    const currentNonce = await PROVIDER.getTransactionCount(user);
    const authorization = await signAuthorization({
      contractAddress: BATCH_CALL_AND_SPONSOR_ADDRESS,
      chainId: CHAIN_ID,
      nonce: currentNonce,
    });

    const result = await callDelegateSetup({
      user,
      authorization: {
        ...authorization,
        v: authorization.v?.toString() || '0',
      },
    });

    return result;
  }

  const signTransaction = async ({ calls }: { calls: Call[] }) => {
    if (!user) {
      throw new Error("Please connect your wallet first");
    }

    // Check if account is delegated (with retries)
    const accountCode = await getAccountCodeWithRetry(user);
    if (!accountCode || !isDelegated(accountCode)) {
      throw new Error("Account not delegated. Please wait for delegation to be confirmed.");
    }

    const contractNonce = await getContractNonce(user);
    
    let encodedCalls = "0x";
    for (const call of calls) {
      encodedCalls += solidityPacked(
        ["address", "uint256", "bytes"],
        [call.to, call.value, call.data]
      ).slice(2);
    }

    const digest = keccak256(
      solidityPacked(["uint256", "bytes"], [contractNonce, encodedCalls]),
    );

    // User signs the digest
    const { signature } = await signMessage({ message: digest }, {
      uiOptions: {
        showWalletUIs: false,
      }
    });

    return signature;
  }

  const transactDelegate = async ({ calls, signature }: { calls: Call[]; signature: string }) => {
    if (!user) {
      throw new Error("Please connect your wallet first");
    }

    const result = await callDelegateTransact({
      user,
      calls,
      signature,
    });
    
    return result;
  }

  return { setupDelegate, signTransaction,  transactDelegate };
}
