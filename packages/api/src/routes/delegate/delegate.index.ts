/**
 * @fileoverview Delegate route registration
 * Registers all delegate routes with their handlers.
 *
 * @module routes/delegate/index
 */

import { createRouter } from "../../lib/create-app";
import { setupRoute, transactRoute } from "./delegate.routes";
import { setupHandler, transactHandler } from "./delegate.handler";

const router = createRouter()
  .openapi(setupRoute, setupHandler)
  .openapi(transactRoute, transactHandler);

export default router;
