import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { EnabledGetter } from '../utils/query'
import type { Authz } from './authz'
import { resolveEnabled } from '../utils/query'

export type QueryOptions<
	TData,
	TError,
> = Simplify<
	& Omit<
		QueryObserverOptions<TData, TError>,
		| 'enabled'
	>
	& {
		enabled?: EnabledGetter
	}
>

export interface Props<
	TData,
	TParams,
	TError,
> {
	params?: TParams
	queryOptions?: Omit<
		QueryOptions<TData, TError>,
		| 'queryFn'
		| 'queryKey'
	>
}

export function createQueryKey<
	TParams,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
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

export interface GetQueryEnabledProps {
	authz: Authz | undefined
	enabled: QueryOptions<unknown, unknown>['enabled']
}

export function getQueryEnabled(
	{
		authz,
		enabled,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		typeof authz?.getPermissions === 'function',
	)
}
