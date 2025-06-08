import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { EnabledGetter } from '../utils/query'
import type { AccessCanParams, AccessCanResult, Authz } from './authz'
import { resolveEnabled } from '../utils/query'

export type QueryOptions<
	TError,
> = Simplify<
	& Omit<
		QueryObserverOptions<AccessCanResult, TError>,
		| 'enabled'
	>
	& {
		enabled?: EnabledGetter
	}
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

export function createQueryFn<
	TError,
>(
	{
		authz,
		getParams,
	}: CreateQueryFnProps,
): NonNullable<QueryOptions<TError>['queryFn']> {
	return async function queryFn() {
		const params = getParams()

		return authz?.access?.(params) ?? DEFAULT_ACCESS_CAN_RESULT
	}
}

export interface GetQueryEnabledProps {
	authz: Authz | undefined
	enabled: QueryOptions<unknown>['enabled']
}

export function getQueryEnabled(
	{
		enabled,
		authz,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		typeof authz?.access === 'function',
	)
}
