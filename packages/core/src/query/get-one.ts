import { hashQueryKey } from '@tanstack/query-core'
import type { QueryClient, QueryKey, QueryOptions } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import { genResourceQueryKey } from './resource'
import type { BaseRecord, GetOneProps, GetOneResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type GetOneQueryProps = Simplify<
	& GetOneProps
	& {
		fetcherName?: string
	}
>

export type GetOneQueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = QueryOptions<
	GetOneResult<TData>,
	TError,
	GetOneResult<TResultData>
>

export function genGetOneQueryKey(
	props: GetOneQueryProps,
): QueryKey {
	const { fetcherName, resource, id, meta } = props

	return [
		...genResourceQueryKey({
			resource,
			fetcherName,
		}),
		'getOne',
		id,
		{ meta },
	]
}

export function createGetOneQueryFn<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
>(
	getProps: () => GetOneQueryProps,
	queryClient: QueryClient,
	fetchers: Fetchers,
): NonNullable<GetOneQueryOptions<TData, unknown, TResultData>['queryFn']> {
	return async function getOneQueryFn() {
		const props = getProps()
		const fetcher = getFetcher(props, fetchers)
		const result = await fetcher.getOne<TData>(props)

		return result
	}
}

export function findGetOneCached<
	TData extends BaseRecord = BaseRecord,
>(
	props: GetOneQueryProps,
	queryClient: QueryClient,
): GetOneResult<TData> | undefined {
	const queryCache = queryClient.getQueryCache()
	const queryHash = hashQueryKey(genGetOneQueryKey(props))
	return queryCache.get<GetOneResult<TData>>(queryHash)?.state.data
}
