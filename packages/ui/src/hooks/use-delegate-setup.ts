import { useMutation } from '@tanstack/react-query';
import { delegateSetup } from '@/infra/api/delegate';
import { Authorization } from '@/types/delegate';

interface DelegateSetupParams {
  user: string;
  authorization: Authorization;
}

export function useDelegateSetup() {
  return useMutation({
    mutationFn: ({ user, authorization }: DelegateSetupParams) => {
      return delegateSetup(user, authorization);
    },
  });
}
