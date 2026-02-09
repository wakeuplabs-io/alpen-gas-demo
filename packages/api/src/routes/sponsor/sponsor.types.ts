import { z } from "zod";

export const RequestSponsorshipRequestSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  operationalAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
});

export type RequestSponsorshipRequest = z.infer<typeof RequestSponsorshipRequestSchema>;

export const RequestSponsorshipResponseSchema = z.object({
  eligible: z.boolean(),
  reason: z.string().nullable(),
  dailyLimit: z.number().int().nonnegative(),
  dailyUsage: z.number().int().nonnegative(),
});

export type RequestSponsorshipResponse = z.infer<typeof RequestSponsorshipResponseSchema>;
