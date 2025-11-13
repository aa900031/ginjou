import type { Enabled, Query, QueryClient, QueryKey } from '@tanstack/query-core'
import { hashKey } from '@tanstack/query-core'

export type OriginQueryEnabledFn<
	TQueryFnData,
	TError,
	TData,
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
	enableds: (Enabled<TQueryFnData, TError, TData> | (() => boolean | undefined) | undefined)[],
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

export function getQuery<
	TQueryFnData,
	TError,
	TData,
>(
	queryKey: QueryKey,
	queryClient: QueryClient,
): Query<TQueryFnData, TError, TData> {
	const cache = queryClient.getQueryCache()
	const query = cache.get(hashKey(queryKey))
	if (!query)
		throw new Error('No')
	return query as any
}
