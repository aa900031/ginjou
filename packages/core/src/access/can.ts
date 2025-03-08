import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { EnabledGetter } from '../utils/query'
import type { Access, AccessCanParams, AccessCanResult } from './access'
import { resolveEnabled } from '../utils/query'

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
	enabled: EnabledGetter
}

export function getQueryEnabled(
	{
		enabled,
		access,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		typeof access?.can === 'function',
	)
}
