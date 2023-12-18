import type { QueryFunction, QueryKey } from '@tanstack/query-core'
import type { Auth, AuthCheckResult } from './auth'

export function genCheckQueryKey<
	TParams = unknown,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
		'check',
		params,
	].filter(Boolean)
}

export interface CreateCheckQueryFnProps<
	TParams = unknown,
> {
	auth: Auth
	getParams: () => TParams
}

export function createCheckQueryFn<
	TParams = unknown,
>(
	props: CreateCheckQueryFnProps<TParams>,
): QueryFunction<AuthCheckResult> {
	return async function checkQueryFn() {
		const { check } = props.auth
		const params = props.getParams()
		const result = await check(params)

		return result
	}
}
