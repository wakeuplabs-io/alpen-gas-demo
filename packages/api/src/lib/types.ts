/* eslint-disable @typescript-eslint/ban-types */
import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
