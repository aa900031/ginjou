import type { MutationKey, MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from '../query/types'
import type { RouterGoFn } from '../router'
import type { Auth, AuthLogoutResult } from './auth'
import { NotificationType } from '../notification'
import { RouterGoType } from '../router'
import { getErrorMessage } from '../utils/error'
import { triggerInvalidateAll } from './invalidate'

export type MutationOptions<
	TParams,
	TError,
> = MutationObserverOptions<
	AuthLogoutResult,
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
	AuthLogoutResult,
	TError,
	TParams
>

export type MutateAsyncFn<
	TParams,
	TError,
> = OptionalMutateAsyncFunction<
	AuthLogoutResult,
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
		'logout',
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
		const { logout } = auth ?? {}
		if (typeof logout !== 'function')
			throw new Error('No')

		const result = await logout(params)
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
		queryClient,
		go,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TParams, TError>['onSuccess']> {
	return async function onSuccess(data) {
		const redirectTo
			= typeof data === 'string'
				? data
				: typeof data === 'boolean' && data === false
					? false
					: '/login'

		await triggerInvalidateAll(queryClient)

		if (redirectTo !== false)
			go({ to: redirectTo, type: RouterGoType.Push })
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
): NonNullable<MutationOptions<TParams, TError>['onError']> {
	return function onError(
		error,
	) {
		notify({
			key: 'logout-error',
			message: translate('auth.logout-error'),
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
		AuthLogoutResult,
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
		AuthLogoutResult,
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
