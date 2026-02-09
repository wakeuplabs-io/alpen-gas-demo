import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";
import {
  RequestSponsorshipRequestSchema,
  RequestSponsorshipResponseSchema,
} from "./sponsor.types";

export const requestSponsorshipRoute = createRoute({
  path: "/sponsor/request",
  method: "post",
  tags: ["Sponsor"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RequestSponsorshipRequestSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      RequestSponsorshipResponseSchema,
      "Sponsorship eligibility check successful"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string(), details: z.any().optional() }),
      "Invalid request"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string(), details: z.string().optional() }),
      "Failed to check sponsorship eligibility"
    ),
  },
});

export type RequestSponsorshipRoute = typeof requestSponsorshipRoute;
