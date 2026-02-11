/**
 * @fileoverview Index route configuration for the API
 * Defines the root endpoint that provides basic API information and health check.
 *
 * @module routes/index
 */
import { createRouter } from "../lib/create-app";
import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { z } from "zod";
import { AppRouteHandler } from "../lib/types";

/**
 * Health check response schema
 */
const HealthCheckResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  service: z.string(),
  version: z.string().optional(),
});

/**
 * Health check route definition
 */
export const healthCheckRoute = createRoute({
  path: "/health",
  method: "get",
  tags: ["Health"],
  summary: "Health check endpoint",
  description: "Returns the health status of the API service",
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      HealthCheckResponseSchema,
      "Service is healthy"
    ),
  },
});

/**
 * Health check handler
 * Returns the current health status of the API
 */
export const healthCheckHandler: AppRouteHandler<typeof healthCheckRoute> = async (c) => {
  return c.json(
    {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      service: "btc-gas-api",
      version: process.env.npm_package_version || "1.0.0",
    },
    HttpStatusCodes.OK
  );
};

/**
 * Index route configuration and handler
 * @description Creates a GET endpoint at the root path that returns API information
 */
const router = createRouter().openapi(healthCheckRoute, healthCheckHandler);

export default router;
