import { type QueryClient, type QueryFunction, type QueryKey, hashQueryKey } from '@tanstack/query-core'
import { genResourceQueryKey } from './resource'
import type { BaseRecord, GetOneProps, GetOneResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type GetOneQueryProps =
	& GetOneProps
	& {
		fetcherName?: string
	}

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
	TData extends BaseRecord = BaseRecord,
>(
	getProps: () => GetOneQueryProps,
	queryClient: QueryClient,
	fetchers: Fetchers,
): QueryFunction<GetOneResult<TData>> {
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
