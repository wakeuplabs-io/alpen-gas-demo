import { z } from 'zod';
import { isAddress } from 'ethers';
import { Address } from '@/types/wallet';

const EnvSchema = z.object({
  VITE_PRIVY_APP_ID: z.string().default(''),
  VITE_PRIVY_CLIENT_ID: z.string().default(''),
  VITE_COUNTER_CONTRACT_ADDRESS: z.string().refine((value) => isAddress(value), {
    message: 'VITE_COUNTER_CONTRACT_ADDRESS must be a valid address',
  }).transform((value) => value as Address),
  VITE_API_URL: z.string().default('http://localhost:5000'),
  VITE_BATCH_CALL_AND_SPONSOR_ADDRESS: z.string().refine((value) => isAddress(value), {
    message: 'BATCH_CALL_AND_SPONSOR_ADDRESS must be a valid address',
  }).transform((value) => value as Address),
  VITE_SPONSOR_WHITELIST_ADDRESS: z.string().refine((value) => isAddress(value), {
    message: 'SPONSOR_WHITELIST_ADDRESS must be a valid address',
  }).transform((value) => value as Address),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: parsedEnv, error } = EnvSchema.safeParse(import.meta.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
}

if (!parsedEnv?.VITE_PRIVY_APP_ID) {
  console.warn('VITE_PRIVY_APP_ID is not set');
}

if (!parsedEnv?.VITE_PRIVY_CLIENT_ID) {
  console.warn('VITE_PRIVY_CLIENT_ID is not set');
}

export const env = {
  privyAppId: parsedEnv?.VITE_PRIVY_APP_ID,
  privyClientId: parsedEnv?.VITE_PRIVY_CLIENT_ID,
  counterAddress: parsedEnv?.VITE_COUNTER_CONTRACT_ADDRESS as Address,
  batchCallAndSponsorAddress: parsedEnv?.VITE_BATCH_CALL_AND_SPONSOR_ADDRESS as Address,
  sponsorWhitelistAddress: parsedEnv?.VITE_SPONSOR_WHITELIST_ADDRESS as Address,
  apiUrl: parsedEnv?.VITE_API_URL,
} as const;