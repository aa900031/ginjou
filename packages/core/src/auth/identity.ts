import type { QueryFunction, QueryKey } from '@tanstack/query-core'
import type { Auth } from './auth'

export function genGetIdentityQueryKey<
	TParams = unknown,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
		'identity',
		params,
	].filter(Boolean)
}

export interface CreateGetIdentityQueryFnProps<
	TParams = unknown,
> {
	auth: Auth
	getParams: () => TParams | undefined
}

export function createGetIdentityQueryFn<
	TData = unknown,
	TParams = unknown,
>(
	props: CreateGetIdentityQueryFnProps<TParams>,
): QueryFunction<TData> {
	return async function getIdentityQueryFn() {
		const { getIdentity } = props.auth
		if (!getIdentity)
			throw new Error('No')

		const params = props.getParams()
		const result = await getIdentity(params)
		return result as TData
	}
}

export interface CheckGetIdentityQueryEnabledProps {
	auth: Auth
}

export function checkGetIdentityQueryEnabled(
	props: CheckGetIdentityQueryEnabledProps,
) {
	return typeof props.auth.getIdentity === 'function'
}
