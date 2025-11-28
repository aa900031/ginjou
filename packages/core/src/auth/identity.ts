import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { Params } from '../query'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { Auth, GetIdentityFn, GetIdentityResult } from './auth'
import { resolveQueryEnableds } from '../utils/query'

export type QueryOptions<
	TData,
	TError,
> = Simplify<
	& QueryObserverOptions<
		GetIdentityResult<TData>,
		TError
	>
	& QueryCallbacks<
		GetIdentityResult<TData>,
		TError
	>
>

export type Props<
	TData,
	TParams extends Params,
	TError,
> = Simplify<
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
	TParams extends Params,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
		'identity',
		params,
	].filter(Boolean)
}

export interface CreateQueryFnProps<
	TParams extends Params,
> {
	auth: Auth | undefined
	getParams: () => TParams | undefined
}

export function createQueryFn<
	TData,
	TParams extends Params,
>(
	{
		auth,
		getParams,
	}: CreateQueryFnProps<TParams>,
): QueryFunction<GetIdentityResult<TData>> {
	return async function queryFn() {
		const { getIdentity } = auth ?? {}
		if (typeof getIdentity !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await (getIdentity as GetIdentityFn<TData, TParams>)(params)
		return result as TData
	}
}

export interface CreateQueryEnabledFnProps<
	TData,
	TError,
> {
	getAuth: () => Auth | undefined
	getEnabled: () => QueryOptions<TData, TError>['enabled']
}

export function createQueryEnabledFn<
	TData,
	TError,
>(
	{
		getAuth,
		getEnabled,
	}: CreateQueryEnabledFnProps<TData, TError>,
): OriginQueryEnabledFn<GetIdentityResult<TData>, TError> {
	return function enabled(
		query,
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => typeof getAuth()?.getIdentity === 'function',
			],
		)
	}
}
