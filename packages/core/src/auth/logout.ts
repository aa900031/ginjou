import type { MutationKey, MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from '../query/types'
import type { RouterGoFn, RouterGoParams } from '../router'
import type { Auth, AuthCommonObjectResult, AuthLogoutResult } from './auth'
import { NotificationType } from '../notification'
import { RouterGoType } from '../router'
import { getErrorMessage } from '../utils/error'
import { getRedirectToByObject, resolveIgnoreInvalidate, resolveRedirectTo } from './helper'
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
	redirectTo?: AuthCommonObjectResult['redirectTo']
	ignoreInvalidate?: boolean
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

export interface CreateSuccessHandlerProps<
	TParams,
	TError,
> {
	queryClient: QueryClient
	go: RouterGoFn
	getProps: () => Props<TParams, TError> | undefined
	onSuccess: MutationOptions<TParams, TError>['onSuccess']
}

const DEFAULT_REDIRECT_TO: RouterGoParams = {
	to: '/login',
	type: RouterGoType.Push,
}

export function createSuccessHandler<
	TParams,
	TError,
>(
	{
		queryClient,
		go,
		getProps,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TParams, TError>,
): NonNullable<MutationOptions<TParams, TError>['onSuccess']> {
	return async function onSuccess(data, propsFromFn, context) {
		const propsFromProps = getProps()
		const redirectTo = resolveRedirectTo(data, propsFromFn, propsFromProps) ?? DEFAULT_REDIRECT_TO
		const ignoreInvalidate = resolveIgnoreInvalidate(data, propsFromFn, propsFromProps) ?? false

		if (!ignoreInvalidate)
			await triggerInvalidateAll(queryClient)

		if (redirectTo !== false)
			go(redirectTo)

		await onSuccessFromProp?.(data, propsFromFn, context)
	}
}

export interface CreateErrorHandlerProps<
	TParams,
	TError,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	go: RouterGoFn
	onError: MutationOptions<TParams, TError>['onError']
}

export function createErrorHandler<
	TParams,
	TError,
>(
	{
		notify,
		translate,
		go,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TParams, TError>,
): NonNullable<MutationOptions<TParams, TError>['onError']> {
	return async function onError(
		error,
		variables,
		context,
	) {
		const redirectTo = getRedirectToByObject(error as any)

		notify({
			key: 'logout-error',
			message: translate('auth.logout-error'),
			description: getErrorMessage(error),
			type: NotificationType.Error,
		})

		if (redirectTo != null && redirectTo !== false)
			go(redirectTo)

		await onErrorFromProp?.(error, variables, context)
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
