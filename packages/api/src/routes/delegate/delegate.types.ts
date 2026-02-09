import { z } from "zod";

export const AuthorizationSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  nonce: z.number().int().nonnegative(),
  chainId: z.number().int().positive(),
  r: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  s: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  v: z.string(),
  yParity: z.union([z.literal(0), z.literal(1)]),
});

export const SetupRequestSchema = z.object({
  user: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  authorization: AuthorizationSchema,
});

export type SetupRequest = z.infer<typeof SetupRequestSchema>;

export const SetupResponseSchema = z.object({
  success: z.boolean(),
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

export const CallSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  value: z.union([z.number().int(), z.string()]),
  data: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

export const TransactRequestSchema = z.object({
  user: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  calls: z.array(CallSchema).min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

export type TransactRequest = z.infer<typeof TransactRequestSchema>;

export const TransactResponseSchema = z.object({
  success: z.boolean(),
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});