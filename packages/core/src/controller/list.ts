import type { Simplify, ValueOf } from 'type-fest'
import { unionWith } from 'lodash-unified'
import { type RouterGoParams, RouterGoType } from '../router'
import type { BaseRecord, Filter, Filters, GetListResult, Pagination, PaginationPayload, Sort, Sorters } from '../query'
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
	initial?: Sorters
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
	const initial = syncRoute
		? resource?.params?.sorters ?? sortersFromProp?.initial
		: sortersFromProp?.initial

	return resolveSorters(
		sortersFromProp?.permanent,
		initial,
	) ?? DEFAULT_SORTERS
}

export interface CreateSetSortersFnProps {
	getSortersFormProp: () => SortersOptions | undefined
	update: (getter: (prev: Sorters) => Sorters) => void
}

export type SetSortersFn = (
	value: Sorters | ((prev: Sorters) => Sorters),
) => void

export function createSetSortersFn(
	{
		getSortersFormProp,
		update,
	}: CreateSetSortersFnProps,
): SetSortersFn {
	return function setSorters(value) {
		const sortersFromProp = getSortersFormProp()

		update((prev) => {
			const nextValue = typeof value === 'function' ? value(prev) : value
			return resolveSorters(sortersFromProp?.permanent, nextValue)
		})
	}
}

export interface FiltersOptions {
	initial?: Filters
	permanent?: Filters
	behavior?: SetFilterBehaviorType
	mode?: 'server' | 'off'
}

export interface GetFiltersProps {
	resource: ResolvedResource | undefined
	syncRoute: boolean | undefined
	filtersFromProp: FiltersOptions | undefined
}

const DEFAULT_FILTERS: Filters = []

export function getInitialFilters(
	{
		resource,
		syncRoute,
		filtersFromProp,
	}: GetFiltersProps,
): Filters {
	const initial = syncRoute
		? resource?.params?.filters ?? filtersFromProp?.initial
		: filtersFromProp?.initial

	return resolveFilters(
		filtersFromProp?.permanent,
		initial,
	) ?? DEFAULT_FILTERS
}

export interface CreateSetFiltersFnProps {
	getFiltersFormProp: () => FiltersOptions | undefined
	update: (getter: (prev: Filters) => Filters) => void
}

export const SetFilterBehavior = {
	Replace: 'replace',
	Merge: 'merge',
} as const

export type SetFilterBehaviorType = ValueOf<typeof SetFilterBehavior>

export type SetFiltersFn = (
	value: Filters | ((prev: Filters) => Filters),
	behavior?: SetFilterBehaviorType
) => void

export function createSetFiltersFn(
	{
		getFiltersFormProp,
		update,
	}: CreateSetFiltersFnProps,
): SetFiltersFn {
	return function setFilters(value, behavior) {
		const filtersFormProp = getFiltersFormProp()

		update((prev) => {
			if (typeof value === 'function')
				return unionWith(filtersFormProp?.permanent, value(prev))

			const _behavior = behavior
				?? filtersFormProp?.behavior
				?? SetFilterBehavior.Merge

			switch (_behavior) {
				case SetFilterBehavior.Merge:
					return unionWith(filtersFormProp?.permanent, value, prev)
				case SetFilterBehavior.Replace:
					return unionWith(filtersFormProp?.permanent, value)
				default:
					throw new Error('No')
			}
		})
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
			return sorters
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

function compareSort(
	left: Sort,
	right: Sort,
): boolean {
	return left.field === right.field
}

function filterSort(
	sort: Sort,
): boolean {
	return sort.order != null
}

function resolveSorters(
	permanent: Sorters | undefined,
	value: Sorters,
): Sorters
function resolveSorters(
	permanent: Sorters | undefined,
	value: Sorters | undefined,
): Sorters | undefined
function resolveSorters(
	permanent: Sorters | undefined,
	value: Sorters | undefined,
): Sorters | undefined {
	if (permanent || value) {
		return unionWith(permanent, value, compareSort)
			.filter(filterSort)
	}
}

function compareFilter(
	left: Filter,
	right: Filter,
) {
	if (
		left.operator !== 'and'
		&& left.operator !== 'or'
		&& right.operator !== 'and'
		&& right.operator !== 'or'
	) {
		return (
			('field' in left ? left.field : undefined)
				=== ('field' in right ? right.field : undefined)
			&& left.operator === right.operator
		)
	}

	return (
		('key' in left ? left.key : undefined)
			=== ('key' in right ? right.key : undefined)
		&& left.operator === right.operator
	)
}

function filterFilter(
	filter: Filter,
): boolean {
	return filter.value !== undefined
		&& filter.value !== null
		&& (filter.operator !== 'or'
			|| (filter.operator === 'or'
				&& filter.value.length !== 0))
		&& (filter.operator !== 'and'
			|| (filter.operator === 'and'
				&& filter.value.length !== 0))
}

function resolveFilters(
	permanent: Filters | undefined,
	value: Filters,
	prev?: Filters
): Filters
function resolveFilters(
	permanent: Filters | undefined,
	value: Filters | undefined,
	prev?: Filters
): Filters | undefined
function resolveFilters(
	permanent: Filters | undefined,
	value: Filters | undefined,
	prev?: Filters,
): Filters | undefined {
	if (permanent || value) {
		return unionWith(permanent, value, prev, compareFilter)
			.filter(filterFilter)
	}
}
