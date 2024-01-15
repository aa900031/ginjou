import type { MutateFunction, MutationFunction, MutationKey, MutationOptions, QueryClient } from '@tanstack/query-core'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { RouterGoFn } from '../router'
import { RouterGoType } from '../router'
import { getErrorMessage } from '../utils/error'
import type { Auth, AuthLoginResult } from './auth'
import { triggerInvalidateAll } from './invalidate'

export type LoginMutateFn<
	TParams,
	TError,
> = MutateFunction<
	AuthLoginResult,
	TError,
	TParams
>

export function createMutationKey(): MutationKey {
	return [
		'auth',
		'login',
	]
}

export interface CreateMutationFnProps {
	auth: Auth
}

export function createMutationFn<
	TParams,
>(
	{
		auth,
	}: CreateMutationFnProps,
): MutationFunction<AuthLoginResult, TParams> {
	return async function mutationFn(params) {
		const { login } = auth

		const result = await login(params)
		return result
	}
}

export interface CreateSuccessHandlerProps {
	queryClient: QueryClient
	go: RouterGoFn
}

export function createSuccessHandler<
	TParams,
>(
	{
		go,
		queryClient,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<AuthLoginResult, unknown, TParams>['onSuccess']> {
	return async function onSuccess(data) {
		const redirectTo
			= typeof data === 'string'
				? data
				: typeof data === 'boolean' && data === false
					? false
					: '/'

		await triggerInvalidateAll(queryClient)

		if (redirectTo !== false)
			go({ to: redirectTo, type: RouterGoType.Replace })
	}
}

export interface CreateErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
}

export function createErrorHandler<
	TParams,
	TError,
>(
	{
		notify,
		translate,
	}: CreateErrorHandlerProps,
): NonNullable<MutationOptions<AuthLoginResult, TError, TParams>['onError']> {
	return function onError(
		error,
	) {
		notify({
			key: 'login-error',
			message: translate('auth.login-error'),
			description: getErrorMessage(error),
			type: NotificationType.Error,
		})
	}
}
