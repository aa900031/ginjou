import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { Auth, GetIdentityFn } from './auth'
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

export interface Props<
	TData,
	TParams,
	TError,
> {
	params?: TParams
	queryOptions?: QueryOptions<TData, TError>
}

export function createQueryKey<
	TParams,
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
): OriginQueryEnabledFn<TData, TError, TData> {
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
