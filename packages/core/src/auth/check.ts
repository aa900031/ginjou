import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { Params } from '../query'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { Auth, CheckAuthFn, CheckAuthResult } from './auth'
import { resolveQueryEnableds } from '../utils/query'

export type QueryOptions<
	TError,
> = Simplify<
	& QueryObserverOptions<
		CheckAuthResult,
		TError
	>
	& QueryCallbacks<
		CheckAuthResult,
		TError
	>
>

export interface Props<
	TParams extends Params,
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
	TParams extends Params,
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
	TParams extends Params,
>(
	{
		auth,
		getParams,
	}: CreateQueryFnProps<TParams>,
): QueryFunction<CheckAuthResult> {
	return async function queryFn() {
		const { check } = auth ?? {}
		if (typeof check !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await (check as CheckAuthFn<TParams>)(params)

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
): OriginQueryEnabledFn<CheckAuthResult, TError, CheckAuthResult> {
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
