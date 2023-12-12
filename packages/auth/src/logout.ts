import type { MutateFunction, MutationFunction, MutationKey, MutationOptions, QueryClient } from '@tanstack/query-core'
import type { Auth, AuthLogoutResult } from './auth'
import { triggerInvalidateAll } from './invalidate'

export type LogoutMutateFn<
	TParams = unknown,
	TError = unknown,
> = MutateFunction<
	AuthLogoutResult,
	TError,
	TParams
>

export function genLogoutMutationKey(): MutationKey {
	return [
		'auth',
		'logout',
	]
}

export interface CreateLogoutMutationFnProps {
	auth: Auth
}

export function createLogoutMutationFn<
	TParams = unknown,
>(
	props: CreateLogoutMutationFnProps,
): MutationFunction<AuthLogoutResult, TParams> {
	return async function logoutMutationFn(params) {
		const { logout } = props.auth
		const result = await logout(params)
		return result
	}
}

export interface CreateLogoutSuccessHandlerProps {
	queryClient: QueryClient
}

export function createLogoutSuccessHandler<
	TParams = unknown,
>(
	props: CreateLogoutSuccessHandlerProps,
): NonNullable<MutationOptions<AuthLogoutResult, unknown, TParams>['onSuccess']> {
	return async function handleLogoutSuccess() {
		const { queryClient } = props
		await triggerInvalidateAll(queryClient)
	}
}
