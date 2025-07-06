import type { MutationKey, MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from '../query/types'
import type { RouterGoFn, RouterGoParams } from '../router'
import type { Auth, AuthCommonObjectResult, AuthLoginResult } from './auth'
import { NotificationType } from '../notification'
import { RouterGoType } from '../router'
import { getErrorMessage } from '../utils/error'
import { getRedirectToByObject, resolveIgnoreInvalidate, resolveRedirectTo } from './helper'
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
	redirectTo?: AuthCommonObjectResult['redirectTo']
	ignoreInvalidate?: boolean
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

export interface CreateSuccessHandlerProps<
	TParams,
	TError,
> {
	queryClient: QueryClient
	go: RouterGoFn
	getProps: () => Props<TParams, TError> | undefined
}

const DEFAULT_REDIRECT_TO: RouterGoParams = {
	to: '/',
	type: RouterGoType.Replace,
}

export function createSuccessHandler<
	TParams,
	TError,
>(
	{
		queryClient,
		go,
		getProps,
	}: CreateSuccessHandlerProps<TParams, TError>,
): NonNullable<MutationOptions<TParams, TError>['onSuccess']> {
	return async function onSuccess(data, propsFromFn) {
		const propsFromProps = getProps()
		const redirectTo = resolveRedirectTo(data, propsFromFn, propsFromProps) ?? DEFAULT_REDIRECT_TO
		const ignoreInvalidate = resolveIgnoreInvalidate(data, propsFromFn, propsFromProps) ?? false

		if (!ignoreInvalidate)
			await triggerInvalidateAll(queryClient)

		if (redirectTo !== false)
			go(redirectTo)
	}
}

export interface CreateErrorHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	go: RouterGoFn
}

export function createErrorHandler<
	TParams,
	TError,
>(
	{
		notify,
		translate,
		go,
	}: CreateErrorHandlerProps,
): NonNullable<MutationOptions<TParams, TError>['onError']> {
	return function onError(
		error,
	) {
		const redirectTo = getRedirectToByObject(error as any)

		notify({
			key: 'login-error',
			message: translate('auth.login-error'),
			description: getErrorMessage(error),
			type: NotificationType.Error,
		})

		if (redirectTo != null && redirectTo !== false)
			go(redirectTo)
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
