import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

expand(
  config({
    path: path.resolve(process.cwd(), process.env.NODE_ENV === "test" ? ".env.test" : ".env"),
  }),
);

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  RPC_URL: z.string(),
  SPONSOR_PRIVATE_KEY: z.string(),
  BATCH_CALL_AND_SPONSOR_ADDRESS: z.string(),
  SPONSOR_WHITELIST_ADDRESS: z.string().optional(),
});

export type EnvType = z.infer<typeof EnvSchema>;

const { data: envConfig, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

if (!envConfig) {
  console.error("❌ No env config found");
  process.exit(1);
}

export const env = {
  nodeEnv: envConfig?.NODE_ENV,
  port: envConfig?.PORT,
  logLevel: envConfig?.LOG_LEVEL,
  corsOrigins: envConfig?.CORS_ORIGINS,
  rpcUrl: envConfig?.RPC_URL,
  sponsorPrivateKey: envConfig?.SPONSOR_PRIVATE_KEY,
  batchCallAndSponsorAddress: envConfig?.BATCH_CALL_AND_SPONSOR_ADDRESS,
  sponsorWhitelistAddress: envConfig?.SPONSOR_WHITELIST_ADDRESS,
};
