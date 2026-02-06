/**
 * @fileoverview Pino logger middleware configuration for Hono
 * This file configures a logging middleware using Pino with environment-specific settings.
 *
 * @module middlewares/pino-logger
 */

import { pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import { env }   from "../config/env";

/**
 * Creates a configured Pino logger middleware instance
 * @returns {import('hono-pino').PinoMiddleware} Configured Pino middleware for Hono
 */
export function pinoLogger() {
  return logger({
    pino: pino(
      {
        level: env.logLevel || "warn",
      },
      env.nodeEnv === "production" ? undefined : pretty(),
    ),
  });
}
