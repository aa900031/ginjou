import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { Authz, CanAccessParams, CanAccessResult } from './authz'
import { resolveQueryEnableds } from '../utils/query'

export type QueryOptions<
	TError,
> = Simplify<
	& QueryObserverOptions<
		CanAccessResult,
		TError
	>
	& QueryCallbacks<
		CanAccessResult,
		TError
	>
>

export type Props<
	TError,
> = Simplify<
	& CanAccessParams
	& {
		queryOptions?: Omit<
			QueryOptions<TError>,
			| 'queryFn'
			| 'queryKey'
			| 'retry'
		>
	}
>

export interface CreateQueryKeyProps {
	params?: CanAccessParams
}

export function createQueryKey(
	{
		params,
	}: CreateQueryKeyProps,
): QueryKey {
	return [
		'authz',
		'access',
		params?.resource,
		params?.action,
		params?.params,
		params?.meta,
	].filter(item => item != null)
}

export interface CreateQueryFnProps {
	authz: Authz | undefined
	getParams: () => CanAccessParams
}

const DEFAULT_CAN_ACCESS_RESULT: CanAccessResult = {
	can: true,
}

export function createQueryFn(
	{
		authz,
		getParams,
	}: CreateQueryFnProps,
): QueryFunction<CanAccessResult> {
	return async function queryFn() {
		const params = getParams()

		return authz?.access?.(params) ?? DEFAULT_CAN_ACCESS_RESULT
	}
}

export interface CreateQueryEnabledFnProps<
	TError,
> {
	getAuthz: () => Authz | undefined
	getEnabled: () => QueryOptions<TError>['enabled']
}

export function createQueryEnabledFn<
	TError,
>(
	{
		getAuthz,
		getEnabled,
	}: CreateQueryEnabledFnProps<TError>,
): OriginQueryEnabledFn<CanAccessResult, TError> {
	return function enabled(
		query,
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => typeof getAuthz()?.access === 'function',
			],
		)
	}
}
