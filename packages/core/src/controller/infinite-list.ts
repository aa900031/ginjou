import type { InfiniteData } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { BaseRecord, GetInfiniteList, GetInfiniteListResult, Pagination } from '../query'
import type { FiltersProp as _FiltersProp, SortersProp as _SortersProp } from './list'

export type PaginationProp<
	TPageParam,
> = Simplify<
	& Partial<Pagination<TPageParam>>
	& {
		init?: TPageParam
	}
>

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& Omit<
		GetInfiniteList.Props<TData, TError, TResultData, TPageParam>,
		| 'pagination'
		| 'sorters'
		| 'filters'
	>
	& {
		pagination?: PaginationProp<TPageParam>
		sorters?: _SortersProp
		filters?: _FiltersProp
		syncRoute?: boolean
	}
>

export interface GetPaginationForQueryProps<
	TPageParam,
> {
	currentPage: TPageParam
	perPage: number
}

export function getPaginationForQuery<
	TPageParam,
>(
	{
		currentPage,
		perPage,
	}: GetPaginationForQueryProps<TPageParam>,
): Pagination<TPageParam> {
	return {
		current: currentPage,
		perPage,
	}
}

export interface GetPageCountProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	perPage: number
	queryData: InfiniteData<GetInfiniteListResult<TResultData, TPageParam>> | undefined
}

export function getPageCount<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		perPage,
		queryData,
	}: GetPageCountProps<TResultData, TPageParam>,
): number | undefined {
	const last = lastPage(queryData)
	if (last?.total == null)
		return

	return perPage
		? Math.ceil(last.total / perPage)
		: 1
}

export interface GetTotalProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	queryData: InfiniteData<GetInfiniteListResult<TResultData, TPageParam>> | undefined
}

export function getTotal<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		queryData,
	}: GetTotalProps<TResultData, TPageParam>,
): number | undefined {
	const last = lastPage(queryData)
	return last?.total
}

function lastPage<
	TData extends InfiniteData<unknown, unknown>,
>(
	data: TData | undefined,
): TData['pages'][number] | undefined {
	if (data?.pages == null || data.pages.length < 1)
		return

	return data.pages[data.pages.length - 1]
}
