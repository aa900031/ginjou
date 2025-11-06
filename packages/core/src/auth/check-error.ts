import type { MutationFunction, MutationKey, MutationObserverOptions } from '@tanstack/query-core'
import type { OriginMutateAsyncFunction } from '../query/types'
import type { RouterGoFn } from '../router'
import type { Logout } from './'
import type { Auth, AuthCheckErrorResult } from './auth'
import { getRedirectToByObject } from './helper'

export type MutationOptions<
	TParams,
	TError,
> = MutationObserverOptions<
	AuthCheckErrorResult,
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

export interface Props<
	TParams,
	TError,
> {
	mutationOptions?: MutationOptionsFromProps<TParams, TError>
}

export function createMutationKey(): MutationKey {
	return [
		'auth',
		'checkError',
	]
}

export interface CreateMutationFnProps {
	auth: Auth | undefined
}

export type MutateAsyncFn<
	TParams,
	TError,
> = OriginMutateAsyncFunction<
	AuthCheckErrorResult,
	TError,
	TParams
>

export function createMutationFn<
	TParams,
>(
	{
		auth,
	}: CreateMutationFnProps,
): MutationFunction<AuthCheckErrorResult, TParams> {
	return async function mutationFn(params) {
		const checkError = auth?.checkError
		if (typeof checkError !== 'function')
			return {}

		const result = await checkError(params)
		return result
	}
}

export interface CreateSuccessHandlerProps<
	TParams,
	TError,
> {
	logout: Logout.MutateAsyncFn<unknown, unknown>
	go: RouterGoFn
	onSuccess: MutationOptions<TParams, TError>['onSuccess']
}

export function createSuccessHandler<
	TParams,
	TError,
>(
	{
		logout,
		go,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TParams, TError>,
): NonNullable<MutationOptions<TParams, TError>['onSuccess']> {
	return async function onSuccess(data, propsFromFn, onMutateResult, context) {
		const redirectTo = getRedirectToByObject(data)
		const { logout: shouldLogout } = data
		if (shouldLogout) {
			await logout({
				redirectTo,
			})
			return
		}

		if (redirectTo != null && redirectTo !== false)
			go(redirectTo)

		await onSuccessFromProp?.(data, propsFromFn, onMutateResult, context)
	}
}
