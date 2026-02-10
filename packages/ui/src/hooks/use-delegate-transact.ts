import { useMutation } from '@tanstack/react-query';
import { delegateTransact } from '@/infra/api/delegate';
import { Call } from '@/types/delegate';

interface DelegateTransactParams {
  user: string;
  calls: Call[];
  signature: string;
}

interface TransactResponse {
  success: boolean;
  hash: string;
  error?: string;
}

export function useDelegateTransact() {
  return useMutation({
    mutationFn: ({ user, calls, signature }: DelegateTransactParams) => {
      return delegateTransact(user, calls, signature);
    },
    onSuccess: (data: TransactResponse) => {
      if (!data.success) {
        throw new Error(data.error);
      }
      return data.hash as string;
    }
  });
}
