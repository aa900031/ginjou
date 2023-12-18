import type { QueryFunction, QueryKey } from '@tanstack/query-core'
import type { Auth } from './auth'

export function genPermissionsQueryKey<
	TParams = unknown,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
		'permissions',
		params,
	].filter(Boolean)
}

export interface CreatePermissionsQueryFnProps<
	TParams = unknown,
> {
	auth: Auth
	getParams: () => TParams | undefined
}

export function createPermissionsQueryFn<
	TData = unknown,
	TParams = unknown,
>(
	props: CreatePermissionsQueryFnProps<TParams>,
): QueryFunction<TData> {
	return async function permissionsQueryFn() {
		const { getPermissions } = props.auth
		if (!getPermissions)
			throw new Error('No')

		const params = props.getParams()
		const result = await getPermissions(params)

		return result as TData
	}
}

export interface CheckPermissionsEnabledProps {
	auth: Auth
}

export function checkPermissionsEnabled(
	props: CheckPermissionsEnabledProps,
) {
	return typeof props.auth.getPermissions === 'function'
}
