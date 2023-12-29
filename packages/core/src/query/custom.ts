import type { QueryFunction, QueryKey, QueryObserverOptions, QueryOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { BaseRecord, CustomProps, CustomResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type CustomQueryProps<
	TQuery = unknown,
	TPayload = unknown,
> = Simplify<
	& CustomProps<TQuery, TPayload>
	& {
		fetcherName?: string
	}
>

export type CustomQueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = QueryObserverOptions<
	CustomResult<TData>,
	TError,
	CustomResult<TResultData>
>

export function genCustomQueryKey(
	props: CustomQueryProps,
): QueryKey {
	const { fetcherName, method, url, ...rest } = props

	return [
		fetcherName,
		'custom',
		method,
		url,
		rest,
	]
}

export function createCustomQueryFn<
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
>(
	getProps: () => CustomQueryProps<TQuery, TPayload>,
	fetchers: Fetchers,
): QueryFunction<CustomResult<TData>> {
	return async function customQueryFn() {
		const props = getProps()
		const fetcher = getFetcher(props, fetchers)
		if (typeof fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')

		const result = await fetcher.custom<TData, TQuery, TPayload>(props)

		return result
	}
}
