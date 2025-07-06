import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { RouterGoFn, RouterGoParams } from '../router'
import type { EnabledGetter } from '../utils/query'
import type { Auth, AuthCheckResult } from './auth'
import { resolveEnabled } from '../utils/query'
import { getRedirectToByObject } from './helper'

export type QueryOptions<
	TError,
> = Simplify<
	& Omit<
		QueryObserverOptions<AuthCheckResult, TError>,
		| 'enabled'
	>
	& QueryCallbacks<
		AuthCheckResult,
		TError
	>
	& {
		enabled?: EnabledGetter
	}
>

export interface Props<
	TParams,
	TError,
> {
	params?: TParams
	redirectTo?:
		| false
		| string
		| RouterGoParams
	queryOptions?: Omit<
		QueryOptions<TError>,
		| 'queryFn'
		| 'queryKey'
		| 'retry'
	>
}

export function createQueryKey<
	TParams,
>(
	params?: TParams,
): QueryKey {
	return [
		'auth',
		'check',
		params,
	].filter(Boolean)
}

export interface CreateQueryFnProps<
	TParams,
> {
	auth: Auth | undefined
	getParams: () => TParams | undefined
}

export function createQueryFn<
	TParams,
	TError,
>(
	{
		auth,
		getParams,
	}: CreateQueryFnProps<TParams>,
): NonNullable<QueryOptions<TError>['queryFn']> {
	return async function checkQueryFn() {
		const { check } = auth ?? {}
		if (typeof check !== 'function')
			throw new Error('No')

		const params = getParams()
		const result = await check(params)

		return result
	}
}

export interface GetQueryEnabledProps {
	auth: Auth | undefined
	enabled: QueryOptions<unknown>['enabled']
}

export function getQueryEnabled(
	{
		auth,
		enabled,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		typeof auth?.check === 'function',
	)
}

export interface CreateErrorHandlerProps<
	TParams,
	TError,
> {
	go: RouterGoFn
	getRedirectTo: () => Props<TParams, TError>['redirectTo']
}

export function createErrorHandler<
	TParams,
	TError,
>(
	{
		go,
		getRedirectTo,
	}: CreateErrorHandlerProps<TParams, TError>,
): NonNullable<QueryOptions<TError>['onError']> {
	return function onError(error) {
		const redirectTo = getRedirectToByObject(error as any)
			?? getRedirectToByObject({ redirectTo: getRedirectTo() })

		if (redirectTo != null && redirectTo !== false)
			go(redirectTo)
	}
}
