/**
 * @fileoverview Delegate route definitions
 * Defines the OpenAPI schema for EIP-7702 delegation endpoints.
 *
 * @module routes/delegate/routes
 */

import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { SetupRequestSchema, SetupResponseSchema, TransactRequestSchema, TransactResponseSchema } from "./delegate.types";
import { z } from "zod";

export const setupRoute = createRoute({
  path: "/delegate/setup",
  method: "post",
  tags: ["Delegate"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SetupRequestSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      SetupResponseSchema,
      "Delegation setup successful"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string(), details: z.any().optional() }),
      "Invalid request"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string(), details: z.string().optional() }),
      "Failed to process transaction"
    ),
  },
});

export const transactRoute = createRoute({
  path: "/delegate/transact",
  method: "post",
  tags: ["Delegate"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: TransactRequestSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      TransactResponseSchema,
      "Transaction executed successfully"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string(), details: z.any().optional() }),
      "Invalid request"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string(), details: z.string().optional() }),
      "Failed to process transaction"
    ),
  },
});

export type SetupRoute = typeof setupRoute;
export type TransactRoute = typeof transactRoute;
