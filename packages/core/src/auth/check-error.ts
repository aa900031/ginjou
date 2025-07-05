import type { MutationFunction, MutationKey, MutationObserverOptions } from '@tanstack/query-core'
import type { RouterGoFn } from '../router'
import type { Auth, AuthCheckErrorResult } from './auth'
import type { MutateAsyncFn } from './logout'
import { RouterGoType } from '../router'

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

export type MutationAsyncFn<
	TParams,
> = MutationFunction<
	AuthCheckErrorResult,
	TParams
>

export function createMutationFn<
	TParams,
	TError,
>(
	{
		auth,
	}: CreateMutationFnProps,
): NonNullable<MutationOptions<TParams, TError>['mutationFn']> {
	return async function mutationFn(params) {
		const checkError = auth?.checkError
		if (typeof checkError !== 'function')
			return {}

		const result = await checkError(params)
		return result
	}
}

export interface CreateSuccessHandlerProps {
	logout: MutateAsyncFn<unknown, unknown>
	go: RouterGoFn
}

export function createSuccessHandler<
	TParams,
	TError,
>(
	{
		logout,
		go,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TParams, TError>['onSuccess']> {
	return async function onSuccess(data) {
		const { logout: shouldLogout, redirectTo } = data
		if (shouldLogout) {
			await logout({
				redirectTo,
			})
			return
		}

		if (redirectTo) {
			go({
				to: redirectTo,
				type: RouterGoType.Replace,
			})
		}
	}
}
