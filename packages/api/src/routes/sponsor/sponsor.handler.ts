import * as HttpStatusCodes from "stoker/http-status-codes";
import { AppRouteHandler } from "../../lib/types";
import { RequestSponsorshipRoute } from "./sponsor.routes";
import { z } from "zod";
import {
  RequestSponsorshipRequest,
  RequestSponsorshipRequestSchema,
} from "./sponsor.types";
import { SponsorWhitelistService } from "../../infra/contracts/sponsor-whitelist";
import { env } from "../../config/env";

/**
 * Checks sponsorship eligibility for a wallet address
 * Queries the SponsorWhitelist contract to determine if the wallet can receive gas sponsorship
 */
export const requestSponsorshipHandler: AppRouteHandler<RequestSponsorshipRoute> = async (c) => {
  try {
    const body = await c.req.json() as RequestSponsorshipRequest;
    const validatedData = RequestSponsorshipRequestSchema.parse(body);

    const sponsorWhitelistAddress = env.sponsorWhitelistAddress;
    if (!sponsorWhitelistAddress) {
      return c.json(
        {
          error: "SponsorWhitelist not configured",
          details: "SPONSOR_WHITELIST_ADDRESS is not set",
        },
        HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    const sponsorWhitelistService = new SponsorWhitelistService(sponsorWhitelistAddress);
    const result = await sponsorWhitelistService.checkEligibility(validatedData.address);

    return c.json(result, HttpStatusCodes.OK);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid input", details: error.issues },
        HttpStatusCodes.BAD_REQUEST
      );
    }

    console.error("Failed to check sponsorship eligibility:", error);
    return c.json(
      {
        error: "Failed to check sponsorship eligibility",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
