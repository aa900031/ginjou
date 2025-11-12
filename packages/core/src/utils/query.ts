import type { Enabled, Query, QueryClient, QueryKey } from '@tanstack/query-core'
import { hashKey } from '@tanstack/query-core'
import { getter } from './getter'

export type EnabledGetter = (() => boolean | undefined) | boolean

export function resolveEnabled(
	enabled: EnabledGetter | undefined,
	condition: boolean | (() => boolean),
): boolean {
	const _enabled = getter(enabled)
	if (_enabled == null)
		return getter(condition)

	return _enabled && getter(condition)
}

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
