/**
 * @fileoverview Factory functions for creating Hono application instances
 * This file provides utilities for creating and configuring Hono applications
 * with OpenAPI support, middleware, and error handling.
 *
 * @module lib/create-app
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError } from "stoker/middlewares";

import type { AppBindings } from "./types";

/**
 * Creates a new OpenAPIHono router instance with default configurations
 * @returns {AppOpenAPI} A configured OpenAPIHono router instance
 * @description
 * Creates a new router with:
 * - Custom AppBindings for type safety
 * - Strict mode disabled
 * - Default OpenAPI hook configuration
 */
export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
  });
}

/**
 * Creates and configures the main application instance with all necessary middleware
 * @returns {AppOpenAPI} A fully configured Hono application instance
 * @description
 * Sets up an application with:
 * - Custom 404 handler
 * - Global error handler
 */
export default function createApp() {
  const app = createRouter();

  app.notFound(notFound);
  app.onError(onError);
  return app;
}

