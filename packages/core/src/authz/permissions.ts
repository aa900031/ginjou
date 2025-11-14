import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { Authz } from './authz'
import { resolveQueryEnableds } from '../utils/query'

export type QueryOptions<
	TData,
	TError,
> = Simplify<
	& QueryObserverOptions<
		TData,
		TError
	>
	& QueryCallbacks<
		TData,
		TError
	>
>

export type Props<
	TData,
	TParams,
	TError,
> = Simplify<
	& {}
	& {
		params?: TParams
		queryOptions?: Omit<
			QueryOptions<TData, TError>,
			| 'queryFn'
			| 'queryKey'
		>
	}
>

export function createQueryKey<
	TParams,
>(
	params?: TParams,
): QueryKey {
	return [
		'authz',
		'permissions',
		params,
	].filter(Boolean)
}

export interface CreateQueryFnProps<
	TParams,
> {
	authz: Authz | undefined
	getParams: () => TParams | undefined
}

export function createQueryFn<
	TData,
	TParams,
>(
	{
		authz,
		getParams,
	}: CreateQueryFnProps<TParams>,
): QueryFunction<TData> {
	return async function queryFn() {
		const { getPermissions } = authz ?? {}
		if (typeof getPermissions !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await getPermissions(params)

		return result as TData
	}
}

export interface CreateQueryEnabledFnProps<
	TData,
	TError,
> {
	getAuthz: () => Authz | undefined
	getEnabled: () => QueryOptions<TData, TError>['enabled']
}

export function createQueryEnabledFn<
	TData,
	TError,
>(
	{
		getAuthz,
		getEnabled,
	}: CreateQueryEnabledFnProps<TData, TError>,
): OriginQueryEnabledFn<TData, TError, TData> {
	return function enabled(
		query,
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => typeof getAuthz()?.getPermissions === 'function',
			],
		)
	}
}
