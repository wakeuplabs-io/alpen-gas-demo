import { handle } from "hono/aws-lambda";
import { serve } from "@hono/node-server";
import { env } from "./config/env";
import app from "./app";

const port = env.port;

// For AWS Lambda
export const handler = handle(app);

// For local development
if (process.env.NODE_ENV !== "production" || process.env.RENDER !== "true") {
  serve({
    fetch: app.fetch,
    port,
  });

  console.log(`
  🚀 Server running!
  📝 API Documentation: http://localhost:${port}/reference
  🔥 REST API: http://localhost:${port}/api
    `);
}
