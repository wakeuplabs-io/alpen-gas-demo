import { isAddress } from 'ethers';
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_PRIVY_APP_ID: z.string().default(''),
  VITE_PRIVY_CLIENT_ID: z.string().default(''),
  VITE_COUNTER_CONTRACT: z.string().refine((value) => isAddress(value), {
    message: 'VITE_COUNTER_CONTRACT must be a valid address',
  }),
  VITE_API_URL: z.string().default('http://localhost:5000'),
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
  counterAddress: parsedEnv?.VITE_COUNTER_CONTRACT as `0x${string}`,
  apiUrl: parsedEnv?.VITE_API_URL,
} as const;