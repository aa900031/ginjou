import type { Simplify } from 'type-fest'
import { type RouterGoParams, RouterGoType } from '../router'
import type { BaseRecord, Filters, GetListResult, Pagination, PaginationPayload, Sorters } from '../query'
import type { ResolvedResource } from '../resource'

export interface GetResourceNameProps {
	resource: ResolvedResource | undefined
	resourceFromProps: string | undefined
}

export function getResourceName(
	{
		resource,
		resourceFromProps,
	}: GetResourceNameProps,
) {
	return resourceFromProps
		?? resource?.resource.name
		?? '' // TODO: // maybe use undeined?
}

export type PaginationOptions<
	TPageParam,
> = Simplify<
	& PaginationPayload<TPageParam>
	& {
		mode?: 'client' | 'server' | 'off'
	}
>

export interface GetInitialCurrentPageProps<
	TPageParam,
> {
	resource: ResolvedResource | undefined
	syncRoute: boolean | undefined
	paginationFromProp: PaginationOptions<TPageParam> | undefined
}

export function getInitialCurrentPage<
	TPageParam,
>(
	{
		resource,
		syncRoute,
		paginationFromProp,
	}: GetInitialCurrentPageProps<TPageParam>,
): Pagination<TPageParam>['current'] {
	if (syncRoute) {
		return resource?.params?.pagination?.current as unknown as TPageParam
			?? paginationFromProp?.current
			?? 1 as TPageParam
	}
	else {
		return paginationFromProp?.current
			?? 1 as TPageParam
	}
}

export function getInitialPerPage<
	TPageParam,
>(
	{
		resource,
		syncRoute,
		paginationFromProp,
	}: GetInitialCurrentPageProps<TPageParam>,
): Pagination<TPageParam>['perPage'] {
	if (syncRoute) {
		return resource?.params?.pagination?.perPage
			?? paginationFromProp?.perPage
			?? 10
	}
	else {
		return paginationFromProp?.perPage
			?? 10
	}
}

export interface SortersOptions {
	inital?: Sorters
	permanent?: Sorters
	mode?: 'server' | 'off'
}

export interface GetSortersProps {
	resource: ResolvedResource | undefined
	syncRoute: boolean | undefined
	sortersFromProp: SortersOptions | undefined
}

const DEFAULT_SORTERS: Sorters = []

export function getInitialSorters(
	{
		resource,
		syncRoute,
		sortersFromProp,
	}: GetSortersProps,
): Sorters {
	if (syncRoute) {
		return resource?.params?.sorters
			?? getSortersValue(sortersFromProp)
			?? DEFAULT_SORTERS
	}
	else {
		return getSortersValue(sortersFromProp)
			?? DEFAULT_SORTERS
	}
}

export interface FiltersOptions {
	inital?: Filters
	permanent?: Filters
	mode?: 'server' | 'off'
}

export interface GetFiltersProps {
	resource: ResolvedResource | undefined
	syncRoute: boolean | undefined
	filtersFromProp: FiltersOptions | undefined
}

const DEFAULT_FILTERS: Filters = {}

export function getInitialFilters(
	{
		resource,
		syncRoute,
		filtersFromProp,
	}: GetFiltersProps,
): Filters {
	if (syncRoute) {
		return resource?.params?.sorters
			?? getFiltersValue(filtersFromProp)
			?? DEFAULT_FILTERS
	}
	else {
		return getFiltersValue(filtersFromProp)
			?? DEFAULT_FILTERS
	}
}

export interface GetPageCountProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	perPage: number
	queryData: GetListResult<TResultData, TPageParam> | undefined
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
	if (queryData?.total == null)
		return

	return perPage
		? Math.ceil(queryData?.total / perPage)
		: 1
}

export interface ToRouterGoParamsProps<
	TPageParam,
> {
	syncRoute: boolean | undefined
	currentPage: TPageParam
	perPage: number
	sorters: Sorters
	filters: Filters
}

export function toRouterGoParams<
	TPageParam,
>(
	{
		syncRoute,
		currentPage,
		perPage,
		sorters,
		filters,
	}: ToRouterGoParamsProps<TPageParam>,
): RouterGoParams | false {
	if (!syncRoute)
		return false

	return {
		type: RouterGoType.Replace,
		keepQuery: true,
		query: {
			current: JSON.stringify(currentPage),
			perPage,
			sorters: JSON.stringify(sorters),
			filters: JSON.stringify(filters),
		},
	}
}

export interface GetFiltersForQuery {
	filtersFromProp: FiltersOptions | undefined
	filters: Filters
}

export function getFiltersForQuery(
	{
		filtersFromProp,
		filters,
	}: GetFiltersForQuery,
) {
	switch (filtersFromProp?.mode) {
		case undefined:
		case 'server':
			return filters // TODO: 移除 filtersFromProp.permanent 內的值
	}
}

export interface GetSortersForQuery {
	sortersFromProp: SortersOptions | undefined
	sorters: Sorters
}

export function getSortersForQuery(
	{
		sortersFromProp,
		sorters,
	}: GetSortersForQuery,
): Sorters | undefined {
	switch (sortersFromProp?.mode) {
		case undefined:
		case 'server':
			return sorters // TODO: 移除 sortersFromProp.permanent 內的值
	}
}

export interface GetPaginationForQueryProps<
	TPageParam,
> {
	paginationFromProp: PaginationOptions<TPageParam> | undefined
	currentPage: TPageParam
	perPage: number
}

export function getPaginationForQuery<
	TPageParam,
>(
	{
		paginationFromProp,
		currentPage,
		perPage,
	}: GetPaginationForQueryProps<TPageParam>,
): Pagination<TPageParam> | undefined {
	switch (paginationFromProp?.mode) {
		case undefined:
		case 'server':
			return {
				current: currentPage,
				perPage,
			}
	}
}

function getSortersValue(
	options?: SortersOptions,
) {
	if (options?.inital?.length || options?.permanent?.length) {
		return [
			...options?.inital ?? [],
			...options?.permanent ?? [], // TODO:
		]
	}
}

function getFiltersValue(
	options?: FiltersOptions,
) {
	if (options?.inital || options?.permanent) {
		return {
			...options?.permanent, // TODO:
			...options?.inital,
		}
	}
}
