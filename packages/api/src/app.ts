/**
 * @fileoverview Main configuration for the Hono API application
 * This file configures and exports the main Hono application instance,
 * including CORS middleware and routing.
 *
 * @module app
 */

import createApp from "./lib/create-app";
import { env } from "./config/env";
import { cors } from "hono/cors";
import index from "./routes/index.route";
import delegate from "./routes/delegate/delegate.index";
import sponsor from "./routes/sponsor/sponsor.index";

/**
 * Main Hono application instance
 * Created using the createApp factory function that configures OpenAPIHono with custom bindings
 * @type {import('./lib/types').AppOpenAPI}
 */
const app = createApp();

/**
 * CORS middleware configuration
 * Allows requests from origins specified in the CORS_ORIGINS environment variable
 * Origins are specified as a comma-separated list
 * @example
 * // Example of CORS_ORIGINS in .env
 * CORS_ORIGINS=http://localhost:3000,https://example.com
 */
const allowedOrigins = env.corsOrigins
  .split(",")
  .map((origin: string) => origin.trim())
  .map((origin: string) => origin.replace(/\/+$/, "")) // Remove trailing slashes
  .filter((origin: string) => origin.length > 0);

console.log("🌐 CORS Configuration:");
console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);

app.use(
  "/*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * Array of available API routes
 * Each route is an OpenAPIHono instance with its own definitions
 * @type {Array<import('./lib/types').AppOpenAPI>}
 */
const routes = [index, delegate, sponsor];

/**
 * Registers all routes under the '/api' prefix
 * This ensures all endpoints are under the /api namespace
 */
routes.forEach((route) => {
  app.route("/api", route);
});

/**
 * Defines the API base routes with their respective endpoints
 * - / : Index route that returns basic API information
 * - /example : Example route that demonstrates basic endpoint structure
 * @type {import('./lib/types').AppOpenAPI}
 */
const apiRoutes = app
  .basePath("/api")
  .route("/", index)
  .route("/delegate", delegate)
  .route("/sponsor", sponsor);

/**
 * Exported type that represents the API route structure
 * Useful for client-side typing and documentation
 */
export type AppType = typeof apiRoutes;

export default app;
