import { PROVIDER } from "@/lib/network";
import { Contract } from "ethers";
import { BATCH_CALL_AND_SPONSOR_ABI } from "../contracts";

export async function getContractNonce(user: string) {
    const delegatedContract = new Contract(
      user,
      BATCH_CALL_AND_SPONSOR_ABI,
      PROVIDER,
    );


    let contractNonce = 0n;
    try {
      contractNonce = await delegatedContract.nonce();
    } catch (error) {
      contractNonce = 0n;
    }

    return contractNonce;
  }