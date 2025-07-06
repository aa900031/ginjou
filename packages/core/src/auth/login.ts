import type { MutationKey, MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from '../query/types'
import type { RouterGoFn } from '../router'
import type { Auth, AuthLoginResult } from './auth'
import { NotificationType } from '../notification'
import { RouterGoType } from '../router'
import { getErrorMessage } from '../utils/error'
import { triggerInvalidateAll } from './invalidate'

export type MutationOptions<
	TParams,
	TError,
> = MutationObserverOptions<
	AuthLoginResult,
	TError,
	TParams
>

export type MutationOptionsFromProps<
	TParams,
	TError,
> = Omit<
	MutationOptions<TParams, TError>,
	| 'mutationFn'
>

export type MutateFn<
	TParams,
	TError,
> = OptionalMutateSyncFunction<
	AuthLoginResult,
	TError,
	TParams
>

export type MutateAsyncFn<
	TParams,
	TError,
> = OptionalMutateAsyncFunction<
	AuthLoginResult,
	TError,
	TParams
>

export interface Props<
	TParams,
	TError,
> {
	mutationOptions?: MutationOptionsFromProps<TParams, TError>
}

export function createMutationKey(): MutationKey {
	return [
		'auth',
		'login',
	]
}

export interface CreateMutationFnProps {
	auth: Auth | undefined
}

export function createMutationFn<
	TParams,
	TError,
>(
	{
		auth,
	}: CreateMutationFnProps,
): NonNullable<MutationOptions<TParams, TError>['mutationFn']> {
	return async function mutationFn(params) {
		const { login } = auth ?? {}
		if (typeof login !== 'function')
			throw new Error('No')

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
	TError,
>(
	{
		go,
		queryClient,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TParams, TError>['onSuccess']> {
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
): NonNullable<MutationOptions<TError, TParams>['onError']> {
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

export interface CreateMutateFnProps<
	TError,
	TParams,
> {
	originFn: OriginMutateSyncFunction<
		AuthLoginResult,
		TError,
		TParams
	>
}

export function createMutateFn<
	TError,
	TParams,
>(
	{
		originFn,
	}: CreateMutateFnProps<TError, TParams>,
): MutateFn<TParams, TError> {
	return function mutateFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

export interface CreateMutateAsyncFnProps<
	TError,
	TParams,
> {
	originFn: OriginMutateAsyncFunction<
		AuthLoginResult,
		TError,
		TParams
	>
}

export function createMutateAsyncFn<
	TError,
	TParams,
>(
	{
		originFn,
	}: CreateMutateAsyncFnProps<TError, TParams>,
): MutateAsyncFn<TParams, TError> {
	return function mutateAsyncFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}
