import type { InfiniteData } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { BaseRecord, Filters, GetInfiniteList, GetInfiniteListResult, Pagination, Sorters } from '../query'
import type { RouterGoParams } from '../router'
import type { FiltersProp, SortersProp } from './list'
import { isEqual } from 'lodash-unified'
import { RouterGoType } from '../router'

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
		sorters?: SortersProp
		filters?: FiltersProp
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
	queryData: InfiniteData<GetInfiniteListResult<TResultData, TPageParam>> | undefined
	perPage: number
}

export function getPageCount<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		queryData,
		perPage,
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

export interface ToRouterGoParamsProps {
	syncRouteFromProp: boolean | undefined

	perPageLocation: number | undefined
	sortersLocation: Sorters | undefined
	filtersLocation: Filters | undefined

	perPage: number
	sorters: Sorters
	filters: Filters
}

export function toRouterGoParams(
	{
		syncRouteFromProp,

		perPageLocation,
		filtersLocation,
		sortersLocation,

		perPage,
		sorters,
		filters,
	}: ToRouterGoParamsProps,
): RouterGoParams | false {
	if (!syncRouteFromProp)
		return false

	if ([
		[perPageLocation, perPage],
		[filtersLocation, sorters],
		[sortersLocation, filters],
	].every(([a, b]) => isEqual(a, b))) {
		return false
	}

	return {
		type: RouterGoType.Replace,
		keepQuery: true,
		query: {
			perPage,
			sorters: JSON.stringify(sorters),
			filters: JSON.stringify(filters),
		},
	}
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
