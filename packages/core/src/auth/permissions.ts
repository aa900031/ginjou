import type { QueryFunction, QueryKey } from '@tanstack/query-core'
import type { Auth } from './auth'

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
	return async function queryFn() {
		const { getPermissions } = auth
		if (!getPermissions)
			throw new Error('No')

		const params = getParams()
		const result = await getPermissions(params)

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
		: typeof auth.getPermissions === 'function'
}
