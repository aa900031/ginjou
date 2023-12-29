import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/vue-query'

export type MutationOptions<
	TData,
	TError,
	TVariables,
	TContext = unknown,
> = Omit<
		UseMutationOptions<TData, TError, TVariables, TContext>,
		| 'mutationFn'
		| 'queryClientKey'
		| 'queryClient'
	>

export type QueryOptions<
	TQueryFnData,
	TError,
	TData,
	TQueryKey extends QueryKey = QueryKey,
> =	Omit<
		UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		| 'queryFn'
		| 'queryClientKey'
		| 'queryClient'
	>
