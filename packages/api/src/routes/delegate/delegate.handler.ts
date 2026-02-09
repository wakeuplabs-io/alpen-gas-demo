/**
 * @fileoverview Delegate route handler implementation
 * Contains the business logic for EIP-7702 delegation endpoints.
 *
 * @module routes/delegate/handler
 */

import * as HttpStatusCodes from "stoker/http-status-codes";
import { AppRouteHandler } from "../../lib/types";
import { SetupRoute, TransactRoute } from "./delegate.routes";
import { ethers } from "ethers";
import { batchCallAndSponsor } from "../../infra/contracts/sponsor";
import { z } from "zod";
import { SetupRequest, TransactRequest } from "./delegate.types";
import { env } from "../../config/env";


/**
 * Sets up EIP-7702 delegation by submitting a type-4 transaction
 * This activates delegation: the EOA's code becomes 0xef0100<implementation-address>
 */
export const setupHandler: AppRouteHandler<SetupRoute> = async (c) => {
  try {
    if (!batchCallAndSponsor.wallet) {
      return c.json(
        { error: "Sponsor not configured", details: "SPONSOR_PRIVATE_KEY is not set" },
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const { user, authorization } = await c.req.json() as SetupRequest;

    // Validate authorization matches expected implementation
    if (batchCallAndSponsor.address && authorization.address.toLowerCase() !== batchCallAndSponsor.address.toLowerCase()) {
      return c.json(
        { error: "Invalid authorization - implementation address mismatch" },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    // Submit type-4 transaction with authorization list
    const authTx = await batchCallAndSponsor.wallet.sendTransaction({
      type: 4,
      to: user,
      authorizationList: [
        {
          address: authorization.address,
          nonce: authorization.nonce,
          chainId: authorization.chainId,
          signature: {
            r: authorization.r,
            s: authorization.s,
            v: BigInt(authorization.v),
            yParity: authorization.yParity,
          },
        },
      ],
    });
    
    await authTx.wait();

    return c.json(
      { success: true, hash: authTx.hash },
      HttpStatusCodes.OK
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request", details: error.issues },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    console.error("Failed to setup delegation:", error);
    return c.json(
      {
        error: "Failed to process transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Executes batched calls through the delegated contract
 * The user's EOA is delegated to BatchCallAndSponsor, so we create a contract instance at the user's address
 */
export const transactHandler: AppRouteHandler<TransactRoute> = async (c) => {
  try {
    const { user, calls, signature } = await c.req.json() as TransactRequest;

    const accountCode = await batchCallAndSponsor.provider.getCode(user);
    
    const isCodeValid = accountCode && accountCode !== "0x" && accountCode !== "0x0" && accountCode.length > 2;
    if (!isCodeValid) {
      return c.json(
        { 
          error: "Account not delegated", 
          details: `EIP-7702 delegation is not active. Account code is "${accountCode}" (expected "0xef0100<address>"). Please call /delegate/setup first to activate delegation.` 
        },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const magicBytes = accountCode.slice(0, 10);
    if (!magicBytes.startsWith('0xef0100')) {
      return c.json(
        { error: "Invalid delegation", details: "Account code does not match EIP-7702 format" },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    const delegatedContract = new ethers.Contract(
      user,
      batchCallAndSponsor.abi,
      batchCallAndSponsor.wallet
    );

    const callTuples = calls.map((call) => [
      call.to,
      BigInt(call.value || "0"),
      call.data,
    ]);
  
    const sponsorWhitelistAddress = env.sponsorWhitelistAddress;
    if (!sponsorWhitelistAddress) {
      return c.json(
        { error: "SponsorWhitelist not configured", details: "SPONSOR_WHITELIST_ADDRESS is not set" },
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const executeTx = await delegatedContract[
      "execute((address,uint256,bytes)[],bytes)"
    ](
      callTuples,
      signature,
      { gasLimit: 5000000 }
    );

    await executeTx.wait();

    return c.json(
      { success: true, hash: executeTx.hash },
      HttpStatusCodes.OK
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request", details: error.issues },
        HttpStatusCodes.BAD_REQUEST
      );
    }
    console.error("Failed to execute transaction:", error);
    return c.json(
      {
        error: "Failed to process transaction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
