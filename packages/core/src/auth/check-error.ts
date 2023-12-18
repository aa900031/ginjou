import type { MutationFunction, MutationKey, MutationOptions } from '@tanstack/query-core'
import type { Auth, AuthCheckErrorResult } from './auth'
import type { LogoutMutateFn } from './logout'

export function genCheckErrorMutationKey(): MutationKey {
	return [
		'auth',
		'checkError',
	]
}

export interface CreateCheckErrorMutatoinFnProps {
	auth: Auth
}

export function createCheckErrorMutatoinFn<
	TParams = unknown,
>(
	props: CreateCheckErrorMutatoinFnProps,
): MutationFunction<AuthCheckErrorResult, TParams> {
	return async function checkErrorMutationFn(params) {
		const { checkError } = props.auth

		const result = await checkError(params)
		return result
	}
}

export interface CreateCheckErrorSuccessHandlerProps {
	logout: LogoutMutateFn
}

export function createCheckErrorSuccessHandler<
	TParams = unknown,
>(
	props: CreateCheckErrorSuccessHandlerProps,
): MutationOptions<AuthCheckErrorResult, unknown, TParams>['onSuccess'] {
	return async function handleCheckErrorSuccess(data) {
		const { logout: shouldLogout, ...rest } = data
		if (shouldLogout)
			await props.logout(rest)

		// TODO: rest.redirectTo
	}
}
