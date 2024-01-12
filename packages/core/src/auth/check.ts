import type { QueryFunction, QueryKey } from '@tanstack/query-core'
import type { Auth, AuthCheckResult } from './auth'

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
	auth: Auth
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
		const { check } = auth
		const params = getParams()
		const result = await check(params)

		return result
	}
}
