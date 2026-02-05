import { keccak256, solidityPacked } from "ethers";
import { useSign7702Authorization, useSignMessage } from "@privy-io/react-auth";

import { BATCH_CALL_AND_SPONSOR_ADDRESS } from "@/infra/contracts";
import { CHAIN_ID, PROVIDER } from "@/lib/network";
import { delegateSetup, delegateTransact } from "@/infra/api/delegate";
import { useWallet } from "./use-wallet";
import { getContractNonce } from "@/infra/contracts/delegated";

interface Call {
  to: string;
  value: string;
  data: string;
}

export function useDelegate() {
  const { address: user } = useWallet();
  const { signMessage } = useSignMessage();
  const { signAuthorization } = useSign7702Authorization();

  const setup = async ({ implementation }: { implementation: string }) => {
    if (!user) {
      throw new Error("User address not found");
    }

    const accountCode = await PROVIDER.getCode(user);
    const currentImplementation = "0x" + accountCode.split("0xef0100")[1];
    if (currentImplementation.toLowerCase() === implementation.toLowerCase()){
      return;
    }

    const currentNonce = await PROVIDER.getTransactionCount(user);
    const authorization = await signAuthorization({
      contractAddress: BATCH_CALL_AND_SPONSOR_ADDRESS,
      chainId: CHAIN_ID,
      nonce: currentNonce,
    });

    const result = await delegateSetup(user, {
      ...authorization,
      v: authorization.v?.toString() || '0',
    });

    return result;
  }

  const transact = async ({ calls }: { calls: Call[] }) => {
    if (!user) {
      throw new Error("Please connect your wallet first");
    }

    await setup({ implementation: BATCH_CALL_AND_SPONSOR_ADDRESS });

    const accountCode = await PROVIDER.getCode(user);
    if (!accountCode || accountCode === "0x" || accountCode === "0x0" || accountCode.length <= 2) {
      throw new Error("Account not delegated. Please wait for delegation to be confirmed.");
    }

    // Check if code starts with EIP-7702 magic bytes (0xef0100)
    const magicBytes = accountCode.slice(0, 10);
    if (!magicBytes.startsWith('0xef0100')) {
      throw new Error("Invalid delegation format. Account code does not match EIP-7702 format.");
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
        showWalletUIs: true
      }
    });


    return await delegateTransact(user, calls, signature);
  }

  return { setup, transact };
}
