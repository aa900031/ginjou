import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { Auth, AuthCheckResult } from './auth'
import { resolveQueryEnableds } from '../utils/query'

export type QueryOptions<
	TError,
> = Simplify<
	& QueryObserverOptions<
		AuthCheckResult,
		TError
	>
	& QueryCallbacks<
		AuthCheckResult,
		TError
	>
>

export interface Props<
	TParams,
	TError,
> {
	params?: TParams
	queryOptions?: Omit<
		QueryOptions<TError>,
		| 'queryFn'
		| 'queryKey'
		| 'retry'
	>
}

export function createQueryKey<
	TParams,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
		'check',
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
	TParams,
>(
	{
		auth,
		getParams,
	}: CreateQueryFnProps<TParams>,
): QueryFunction<AuthCheckResult> {
	return async function queryFn() {
		const { check } = auth ?? {}
		if (typeof check !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await check(params)

		return result
	}
}

export interface CreateQueryEnabledFnProps<
	TError,
> {
	getAuth: () => Auth | undefined
	getEnabled: () => QueryOptions<TError>['enabled']
}

export function createQueryEnabledFn<
	TError,
>(
	{
		getAuth,
		getEnabled,
	}: CreateQueryEnabledFnProps<TError>,
): OriginQueryEnabledFn<AuthCheckResult, TError, AuthCheckResult> {
	return function enabled(
		query,
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => typeof getAuth()?.check === 'function',
			],
		)
	}
}
