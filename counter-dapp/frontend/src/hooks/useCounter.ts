import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type HexString } from '@gear-js/api';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { Sails } from 'sails-js';
import { SailsIdlParser } from 'sails-js-parser';
import { COUNTER_IDL } from '../generated/counter';

type CounterAction = 'Increment' | 'Decrement' | 'Reset';

type MutationInput = {
  action: CounterAction;
};

const counterQueryKey = (programId: string) => ['counter-value', programId] as const;

export function useCounter(programId: string, isApiReady: boolean) {
  const queryClient = useQueryClient();
  const { api } = useApi();
  const { account, isAccountReady } = useAccount();
  const [status, setStatus] = useState<string>('');

  const sailsQuery = useQuery({
    queryKey: ['counter-sails', programId],
    enabled: isApiReady && Boolean(api) && Boolean(programId),
    staleTime: Infinity,
    queryFn: async () => {
      if (!api) throw new Error('Gear API is not ready');

      const parser = await SailsIdlParser.new();
      return new Sails(parser).parseIdl(COUNTER_IDL).setApi(api).setProgramId(programId as HexString);
    },
  });

  const valueQuery = useQuery({
    queryKey: counterQueryKey(programId),
    enabled: Boolean(sailsQuery.data),
    queryFn: async () => {
      if (!sailsQuery.data) throw new Error('Sails client is not ready');

      const result = await sailsQuery.data.services.Counter.queries.Value<number>()
        .withAddress(account?.address ?? zeroAddress())
        .call();

      return Number(result);
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ action }: MutationInput) => {
      if (!sailsQuery.data) throw new Error('Sails client is not ready');
      if (!account) throw new Error('Connect a wallet first');

      setStatus(`${action} submitted`);
      const transaction = sailsQuery.data.services.Counter.functions[action]()
        .withAccount(account.address, { signer: account.signer });

      await transaction.calculateGas(false, 10);
      const result = await transaction.signAndSend();
      setStatus(`${action} included, waiting for reply`);

      const response = await result.response();
      setStatus(`${action} confirmed`);
      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: counterQueryKey(programId) });
    },
    onError: (error) => {
      setStatus(error instanceof Error ? error.message : 'Transaction failed');
    },
  });

  const disabledReason = useMemo(() => {
    if (!isApiReady) return 'Program is not ready yet';
    if (sailsQuery.isLoading) return 'Sails client is loading';
    if (!sailsQuery.data) return 'Sails client is not ready';
    if (!isAccountReady || !account) return 'Connect a wallet first';
    if (mutation.isPending) return 'Transaction is pending';
    return '';
  }, [account, isAccountReady, isApiReady, mutation.isPending, sailsQuery.data, sailsQuery.isLoading]);

  return {
    value: valueQuery.data,
    isValueLoading: valueQuery.isLoading,
    isValueFetching: valueQuery.isFetching,
    error: valueQuery.error ?? sailsQuery.error ?? mutation.error,
    status,
    pendingAction: mutation.variables?.action,
    disabledReason,
    isPending: mutation.isPending,
    refetch: valueQuery.refetch,
    increment: () => mutation.mutate({ action: 'Increment' }),
    decrement: () => mutation.mutate({ action: 'Decrement' }),
    reset: () => mutation.mutate({ action: 'Reset' }),
  };
}

function zeroAddress() {
  return '0x0000000000000000000000000000000000000000000000000000000000000000';
}
