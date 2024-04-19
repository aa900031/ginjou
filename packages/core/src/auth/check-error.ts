import type { MutationFunction, MutationKey, MutationObserverOptions } from '@tanstack/query-core'
import { type RouterGoFn, RouterGoType } from '../router'
import type { Auth, AuthCheckErrorResult } from './auth'
import type { LogoutMutateFn } from './logout'

export type MutationOptions<
	TParams,
	TError,
> = MutationObserverOptions<
	AuthCheckErrorResult,
	TError,
	TParams
>

export function createMutationKey(): MutationKey {
	return [
		'auth',
		'checkError',
	]
}

export interface CreateMutationFnProps {
	auth: Auth | undefined
}

export type MutationFn<
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
	logout: LogoutMutateFn<unknown, unknown>
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
		const { logout: shouldLogout, ...rest } = data
		if (shouldLogout) {
			await logout(rest)
			return
		}

		if (rest.redirectTo) {
			go({
				to: rest.redirectTo,
				type: RouterGoType.Replace,
			})
		}
	}
}
