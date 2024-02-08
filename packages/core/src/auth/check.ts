import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Auth, AuthCheckResult } from './auth'

export interface Props<
	TParams,
	TError,
> {
	params?: TParams
	queryOptions?: Omit<
		QueryObserverOptions<AuthCheckResult, TError>,
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
	enabled?: boolean
}

export function getQueryEnabled(
	{
		auth,
		enabled,
	}: GetQueryEnabledProps,
) {
	return (
		enabled != null ? enabled : true
	) && (
		typeof auth?.check === 'function'
	)
}
