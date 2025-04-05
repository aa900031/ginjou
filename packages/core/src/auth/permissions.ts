import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { EnabledGetter } from '../utils/query'
import type { Auth } from './auth'
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
	auth: Auth | undefined
	getParams: () => TParams | undefined
}

export function createQueryFn<
	TData,
	TParams,
>(
	{
		auth,
		getParams,
	}: CreateQueryFnProps<TParams>,
): QueryFunction<TData> {
	return async function queryFn() {
		const { getPermissions } = auth ?? {}
		if (typeof getPermissions !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await getPermissions(params)

		return result as TData
	}
}

export interface GetQueryEnabledProps {
	auth: Auth | undefined
	enabled: QueryOptions<unknown, unknown>['enabled']
}

export function getQueryEnabled(
	{
		auth,
		enabled,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		typeof auth?.getPermissions === 'function',
	)
}
