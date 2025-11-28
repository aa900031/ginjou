import type { Enabled, Query, QueryClient, QueryKey, QueryKeyHashFunction } from '@tanstack/query-core'
import { hashKey } from '@tanstack/query-core'

export type OriginQueryEnabledFn<
	TQueryFnData,
	TError,
	TData = TQueryFnData,
> = (
	query: Query<TQueryFnData, TError, TData>,
) => boolean

export type QueryEnabledFn<
	TQueryFnData,
	TError,
	TData,
> = (
	query?: Query<TQueryFnData, TError, TData>,
) => boolean

export function resolveQueryEnableds<
	TQueryFnData,
	TError,
	TData,
>(
	query: Query<TQueryFnData, TError, TData>,
	enableds: (
		| Enabled<TQueryFnData, TError, TData>
		| (() => boolean | undefined) | undefined
	)[],
): boolean {
	for (const enabled of enableds) {
		if (enabled === false)
			return false
		if (typeof enabled === 'function') {
			const value = enabled(query)
			if (value === false)
				return false
		}
	}
	return true
}

export interface GetQueryProps<
	TQueryKey extends QueryKey,
> {
	queryKey: TQueryKey
	queryClient: QueryClient
	queryHash?: string
	queryKeyHashFn?: QueryKeyHashFunction<TQueryKey>
}

export function getQuery<
	TQueryFnData,
	TError,
	TData,
>(
	{
		queryKey,
		queryHash,
		queryClient,
		queryKeyHashFn,
	}: GetQueryProps<QueryKey>,
): Query<TQueryFnData, TError, TData> {
	const hash = queryHash ?? (queryKeyHashFn ?? hashKey)(queryKey)
	const cache = queryClient.getQueryCache()
	const query = cache.get<TQueryFnData, TError, TData>(hash)
	if (!query)
		throw new Error(`Query not found in cache for key: ${JSON.stringify(queryKey)}`)
	return query
}
