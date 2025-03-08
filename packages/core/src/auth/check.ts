import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { EnabledGetter } from '../utils/query'
import type { Auth, AuthCheckResult } from './auth'
import { resolveEnabled } from '../utils/query'

export type QueryOptions<
	TError,
> = Simplify<
	& Omit<
		QueryObserverOptions<AuthCheckResult, TError>,
		| 'queryFn'
		| 'queryKey'
		| 'retry'
		| 'enabled'
	>
	& {
		enabled?: EnabledGetter
	}
>

export interface Props<
	TParams,
	TError,
> {
	params?: TParams
	queryOptions?: QueryOptions<TError>
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
	return async function checkQueryFn() {
		const { check } = auth ?? {}
		if (typeof check !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await check(params)

		return result
	}
}

export interface GetQueryEnabledProps {
	auth: Auth | undefined
	enabled: QueryOptions<unknown>['enabled']
}

export function getQueryEnabled(
	{
		auth,
		enabled,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		typeof auth?.check === 'function',
	)
}
