import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { Access, AccessCanParams, AccessCanResult } from './access'

export type QueryOptions<
	TError,
> = QueryObserverOptions<
	AccessCanResult,
	TError
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
	params: AccessCanParams
}

export function createQueryKey(
	{
		params,
	}: CreateQueryKeyProps,
): QueryKey {
	return [
		'access',
		params.resource,
		params.action,
		params.params,
		params.meta,
	]
}

export interface CreateQueryFnProps {
	access: Access | undefined
	getParams: () => AccessCanParams
}

const DEFAULT_ACCESS_CAN_RESULT: AccessCanResult = {
	can: true,
}

export function createQueryFn<
	TError,
>(
	{
		access,
		getParams,
	}: CreateQueryFnProps,
): NonNullable<QueryOptions<TError>['queryFn']> {
	return async function queryFn() {
		const params = getParams()

		return access?.can(params) ?? DEFAULT_ACCESS_CAN_RESULT
	}
}

export interface GetQueryEnabledProps {
	access: Access | undefined
	enabled?: boolean
}

export function getQueryEnabled(
	{
		enabled,
		access,
	}: GetQueryEnabledProps,
): boolean {
	return (
		enabled != null ? enabled : true
	) && (
		typeof access?.can === 'function'
	)
}
