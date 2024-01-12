import type { QueryFunction, QueryKey } from '@tanstack/query-core'
import type { Auth } from './auth'

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
	auth: Auth
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
	return async function getIdentityQueryFn() {
		const { getIdentity } = auth
		if (!getIdentity)
			throw new Error('No')

		const params = getParams()
		const result = await getIdentity(params)
		return result as TData
	}
}

export interface GetQueryEnabledProps {
	auth: Auth
	enabled?: boolean
}

export function getQueryEnabled(
	{
		auth,
		enabled,
	}: GetQueryEnabledProps,
) {
	return enabled != null
		? enabled
		: typeof auth.getIdentity === 'function'
}
