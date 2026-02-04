import { z } from 'zod';

const EnvSchema = z.object({
  VITE_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().default(''),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: parsedEnv, error } = EnvSchema.safeParse(import.meta.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
}

if (!parsedEnv?.VITE_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn('VITE_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

export const env = {
  projectId: parsedEnv?.VITE_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
} as const;