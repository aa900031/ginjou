import type { MutateFunction, MutationFunction, MutationKey, MutationOptions, QueryClient } from '@tanstack/query-core'
import type { Auth, AuthLoginResult } from './auth'
import { triggerInvalidateAll } from './invalidate'

export type LoginMutateFn<
	TParams = unknown,
	TError = unknown,
> = MutateFunction<
	AuthLoginResult,
	TError,
	TParams
>

export function genLoginMutationKey(): MutationKey {
	return [
		'auth',
		'login',
	]
}

export interface CreateLoginMutationFnProps {
	auth: Auth
}
export function createLoginMutationFn<
	TParams = unknown,
>(
	props: CreateLoginMutationFnProps,
): MutationFunction<AuthLoginResult, TParams> {
	return async function loginMutationFn(params) {
		const { login } = props.auth

		const result = await login(params)
		return result
	}
}

export interface CreateLoginSuccessHandlerProps {
	queryClient: QueryClient
}

export function createLoginSuccessHandler<
	TParams = unknown,
>(
	props: CreateLoginSuccessHandlerProps,
): NonNullable<MutationOptions<AuthLoginResult, unknown, TParams>['onSuccess']> {
	return async function handleLoginSuccess() {
		const { queryClient } = props
		await triggerInvalidateAll(queryClient)
	}
}
