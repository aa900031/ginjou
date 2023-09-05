import type { QueryClient, QueryFunction, QueryFunctionContext, QueryKey } from '@tanstack/query-core'
import type { GetListQueryProps } from './get-list'
import { resolvePagination as resolveListPagination } from './get-list'
import { genGetOneQueryKey } from './get-one'
import type { BaseRecord, GetInfiniteListResult, Pagination, PaginationPayload } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

export function createGetInfiniteListQueryFn<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
>(
	getProps: () => GetListQueryProps<TPageParam>,
	queryClient: QueryClient,
	fetchers: Fetchers,
): QueryFunction<GetInfiniteListResult<TData>, QueryKey, TPageParam> {
	return async function getInfiniteListQueryFn(context) {
		const props = getProps()
		const fetcher = getFetcher(props, fetchers)
		const resolvedPagination = resolvePagination<TPageParam>(context, props.pagination)
		const result = await fetcher.getList<TData, TPageParam>({
			...props,
			pagination: resolvedPagination,
		}).then(r => ({
			...r,
			pagination: resolvedPagination,
		}) as GetInfiniteListResult<TData>)

		updateCache(queryClient, props, result)

		return result
	}
}

export function getNextPageParam<
	TData extends BaseRecord = BaseRecord,
>(
	lastPage: GetInfiniteListResult<TData>,
): number | undefined {
	const { cursor, pagination } = lastPage

	if (cursor)
		return cursor.next

	const { current, perPage } = resolveListPagination(pagination)
	const totalPages = Math.ceil((lastPage.total || 0) / perPage)

	return current < totalPages ? Number(current) + 1 : undefined
}

export function getPreviousPageParam<
	TData extends BaseRecord = BaseRecord,
>(
	lastPage: GetInfiniteListResult<TData>,
): number | undefined {
	const { cursor, pagination } = lastPage

	if (cursor)
		return cursor.prev

	const { current } = resolveListPagination(pagination)
	return current === 1 ? undefined : current - 1
}

function resolvePagination<
	TPageParam = number,
>(
	context: QueryFunctionContext<QueryKey, TPageParam>,
	payload?: PaginationPayload<TPageParam>,
): Pagination<TPageParam> {
	return {
		...resolveListPagination(payload),
		current: context.pageParam!,
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
>(
	queryClient: QueryClient,
	props: GetListQueryProps<TPageParam>,
	result: GetInfiniteListResult<TData>,
): void {
	for (const record of result.data) {
		queryClient.setQueryData(
			genGetOneQueryKey({ ...props, id: record.id! }),
			(old: TData | undefined) => old ?? record,
		)
	}
}
