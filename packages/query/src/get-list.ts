import type { QueryClient, QueryFunction, QueryKey } from '@tanstack/query-core'
import { genGetOneQueryKey } from './get-one'
import { genResourceQueryKey } from './resource'
import type { BaseRecord, GetListProps, GetListResult, Meta, Pagination, PaginationPayload } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export type GetListQueryProps<
	TPageParam = number,
> =
	& Omit<GetListProps, 'pagination'>
	& {
		pagination?: PaginationPayload<TPageParam>
		fetcherName?: string
	}

export function genGetListQueryKey(
	props:
	| GetListQueryProps
	| {
		fetcherName?: string
		resource?: string
		meta?: Meta
	},
): QueryKey {
	const { fetcherName, resource, pagination, sorters, filters, meta } = props as GetListQueryProps

	return [
		...genResourceQueryKey({
			fetcherName,
			resource: resource ?? '',
		}),
		'getList',
		{
			pagination, sorters, filters, meta,
		},
	]
}

export function createGetListQueryFn<
	TData extends BaseRecord = BaseRecord,
>(
	getProps: () => GetListQueryProps,
	queryClient: QueryClient,
	fetchers: Fetchers,
): QueryFunction<GetListResult<TData>> {
	return async function getListQueryFn() {
		const props = getProps()
		const resolvedProps = {
			...props,
			pagination: resolvePagination(props.pagination),
		}
		const fetcher = getFetcher(resolvedProps, fetchers)
		const result = await fetcher.getList<TData>(resolvedProps)
		updateCache(queryClient, props, result)

		return result
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
>(
	queryClient: QueryClient,
	props: GetListQueryProps,
	result: GetListResult<TData>,
): void {
	for (const record of result.data) {
		if (record.id == null)
			continue

		queryClient.setQueryData(
			genGetOneQueryKey({ ...props, id: record.id }),
			(old: TData | undefined) => old ?? record,
		)
	}
}

const DEFAULT_PAGINATION: Pagination<number> = {
	current: 1,
	perPage: 10,
}

export function resolvePagination<
	TPageParam = number,
>(
	payload?: PaginationPayload<TPageParam>,
): Pagination<TPageParam> {
	return {
		current: payload?.current ?? DEFAULT_PAGINATION.current,
		perPage: payload?.perPage ?? DEFAULT_PAGINATION.perPage,
	} as Pagination<TPageParam>
}
