import type { QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { OriginQueryEnabledFn } from '../utils/query'
import type { AccessCanParams, AccessCanResult, Authz } from './authz'
import { resolveQueryEnableds } from '../utils/query'

export type QueryOptions<
	TError,
> = Simplify<
	& QueryObserverOptions<
		AccessCanResult,
		TError
	>
	& QueryCallbacks<
		AccessCanResult,
		TError
	>
>

export type Props<
	TError,
> = Simplify<
	& AccessCanParams
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
	params?: AccessCanParams
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
	getParams: () => AccessCanParams
}

const DEFAULT_ACCESS_CAN_RESULT: AccessCanResult = {
	can: true,
}

export function createQueryFn(
	{
		authz,
		getParams,
	}: CreateQueryFnProps,
): QueryFunction<AccessCanResult> {
	return async function queryFn() {
		const params = getParams()

		return authz?.access?.(params) ?? DEFAULT_ACCESS_CAN_RESULT
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
): OriginQueryEnabledFn<AccessCanResult, TError, AccessCanResult> {
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
