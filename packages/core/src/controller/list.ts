import type { Simplify, ValueOf } from 'type-fest'
import { get, isEqual, unionWith } from 'lodash-unified'
import type { RouterGoParams } from '../router'
import { RouterGoType } from '../router'
import type { BaseRecord, Filter, Filters, GetList, GetListResult, Pagination, Sort, Sorters } from '../query'
import { FilterOperator } from '../query'
import type { ResolvedResource } from '../resource'

export type PaginationProp = Simplify<
	& Partial<Pagination<number>>
	& {
		mode?: 'client' | 'server' | 'off'
	}
>

export interface SortersOptions {
	value?: Sorters
	permanent?: Sorters
	mode?: 'server' | 'off'
}

export type SortersProp =
	| Sorters
	| SortersOptions

export interface FiltersOptions {
	value?: Filters
	permanent?: Filters
	behavior?: SetFilterBehaviorType
	mode?: 'server' | 'off'
}

export type FiltersProp =
	| Filters
	| FiltersOptions

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& Omit<
			GetList.Props<TData, TError, TResultData, number>,
			| 'pagination'
			| 'sorters'
			| 'filters'
			| 'syncRoute'
		>
	& {
		pagination?: PaginationProp
		sorters?: SortersProp
		filters?: FiltersProp
		syncRoute?: boolean
	}
>

export interface GetPropCurrentPageProps {
	prop: PaginationProp | undefined
	prev?: PaginationProp['current']
}

export function getPropCurrentPage(
	{
		prop,
		prev,
	}: GetPropCurrentPageProps,
): PaginationProp['current'] {
	return getSubValue({
		path: 'current',
		prop,
		prev,
	})
}

export interface GetPropPerPageProps {
	prop: PaginationProp | undefined
	prev?: PaginationProp['perPage']
}

export function getPropPerPage(
	{
		prop,
		prev,
	}: GetPropPerPageProps,
): PaginationProp['perPage'] {
	return getSubValue({
		path: 'perPage',
		prop,
		prev,
	})
}

export interface GetPropPaginationModeProps {
	prop: PaginationProp | undefined
	prev?: PaginationProp['mode']
}

export function getPropPaginationMode(
	{
		prop,
		prev,
	}: GetPropPaginationModeProps,
): PaginationProp['mode'] {
	return getSubValue({
		path: 'mode',
		prop,
		prev,
	})
}

export interface GetPropFiltersProps {
	prop: FiltersProp | undefined
	prev?: Filters
}

export function getPropFilters(
	{
		prop,
		prev,
	}: GetPropFiltersProps,
) {
	return getSubValue({
		path: 'value',
		prop,
		prev,
		isValue: checkFiltersValue,
	})
}

export interface GetPropFiltersPermanentProps {
	prop: FiltersProp | undefined
	prev?: FiltersOptions['permanent']
}

export function getPropFiltersPermanent(
	{
		prop,
		prev,
	}: GetPropFiltersPermanentProps,
): FiltersOptions['permanent'] {
	return getSubValue({
		path: 'permanent',
		prop,
		prev,
	})
}

export interface GetPropFiltersBehaviorProps {
	prop: FiltersProp | undefined
	prev?: FiltersOptions['behavior']
}

export function getPropFiltersBehavior(
	{
		prop,
		prev,
	}: GetPropFiltersBehaviorProps,
): FiltersOptions['behavior'] {
	return getSubValue({
		path: 'behavior',
		prop,
		prev,
	})
}

export interface GetPropFiltersModeProps {
	prop: FiltersProp | undefined
	prev?: FiltersOptions['mode']
}

export function getPropFiltersMode(
	{
		prop,
		prev,
	}: GetPropFiltersModeProps,
): FiltersOptions['mode'] {
	return getSubValue({
		path: 'mode',
		prop,
		prev,
	})
}

export interface GetPropSortersProps {
	prop: SortersProp | undefined
	prev?: Sorters
}

export function getPropSorters(
	{
		prop,
		prev,
	}: GetPropSortersProps,
) {
	return getSubValue({
		path: 'value',
		prop,
		prev,
		isValue: checkSortersValue,
	})
}

export interface GetPropSortersPermanentProps {
	prop: SortersProp | undefined
	prev?: SortersOptions['permanent']
}

export function getPropSortersPermanent(
	{
		prop,
		prev,
	}: GetPropSortersPermanentProps,
): SortersOptions['permanent'] {
	return getSubValue({
		path: 'permanent',
		prop,
		prev,
	})
}

export interface GetPropSortersModeProps {
	prop: SortersProp | undefined
	prev?: SortersOptions['mode']
}

export function getPropSortersMode(
	{
		prop,
		prev,
	}: GetPropSortersModeProps,
): SortersOptions['mode'] {
	return getSubValue({
		path: 'mode',
		prop,
		prev,
	})
}

export interface GetResourceCurrentPageProps {
	prop: ResolvedResource | undefined
	prev?: Pagination['current']
}

export function getResourceCurrentPage(
	{
		prop,
		prev,
	}: GetResourceCurrentPageProps,
): number | undefined {
	return getSubValue({
		path: 'params.pagination.current',
		prop,
		prev,
	})
}

export interface GetResourcePerPageProps {
	prop: ResolvedResource | undefined
	prev?: Pagination<number>['perPage']
}

export function getResourcePerPage(
	{
		prop,
		prev,
	}: GetResourcePerPageProps,
): number | undefined {
	return getSubValue({
		path: 'params.pagination.perPage',
		prop,
		prev,
	})
}

export interface GetResourceFiltersProps {
	prop: ResolvedResource | undefined
	prev?: Filters
}

export function getResourceFilters(
	{
		prop,
		prev,
	}: GetResourceFiltersProps,
): Filters | undefined {
	return getSubValue({
		path: 'params.filters',
		prop,
		prev,
	})
}

export interface GetResourceSortersProps {
	prop: ResolvedResource | undefined
	prev?: Sorters
}

export function getResourceSorters(
	{
		prop,
		prev,
	}: GetResourceSortersProps,
): Sorters | undefined {
	return getSubValue({
		path: 'params.sorters',
		prop,
		prev,
	})
}

export interface GetCurrentPageProps {
	currentPageFromProp: PaginationProp['current'] | undefined
	currentPageFromResource: PaginationProp['current'] | undefined
	syncRouteFromProp: boolean | undefined
}

export function getCurrentPage(
	{
		currentPageFromProp,
		currentPageFromResource,
		syncRouteFromProp,
	}: GetCurrentPageProps,
): Pagination<number>['current'] {
	if (syncRouteFromProp) {
		return currentPageFromResource
			?? currentPageFromProp
			?? 1
	}
	else {
		return currentPageFromProp
			?? 1
	}
}

export interface GetPerPageProps {
	perPageFromProp: PaginationProp['perPage'] | undefined
	perPageFromResource: PaginationProp['perPage'] | undefined
	syncRouteFromProp: boolean | undefined
}

export function getPerPage(
	{
		perPageFromProp,
		perPageFromResource,
		syncRouteFromProp,
	}: GetPerPageProps,
): Pagination<number>['perPage'] {
	if (syncRouteFromProp) {
		return perPageFromResource
			?? perPageFromProp
			?? 10
	}
	else {
		return perPageFromProp
			?? 10
	}
}

export interface GetFiltersProps {
	filtersFromResource: Filters | undefined
	filtersFromProp: Filters | undefined
	filtersPermanentFromProp: FiltersOptions['permanent'] | undefined
	syncRouteFromProp: boolean | undefined
}

const DEFAULT_FILTERS: Filters = []

export function getFilters(
	{
		filtersFromResource,
		filtersFromProp,
		filtersPermanentFromProp,
		syncRouteFromProp,
	}: GetFiltersProps,
): Filters {
	const value = syncRouteFromProp
		? filtersFromResource ?? filtersFromProp
		: filtersFromProp

	return resolveFilters(
		filtersPermanentFromProp,
		value,
	) ?? DEFAULT_FILTERS
}

export interface CreateSetFiltersFnProps {
	getFiltersPermanent: () => FiltersOptions['permanent']
	getFiltersBehavior: () => FiltersOptions['behavior']
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
		getFiltersPermanent,
		getFiltersBehavior,
		update,
	}: CreateSetFiltersFnProps,
): SetFiltersFn {
	return function setFilters(value, behavior) {
		update((prev) => {
			if (typeof value === 'function')
				return unionWith(getFiltersPermanent(), value(prev))

			const _behavior = behavior
				?? getFiltersBehavior()
				?? SetFilterBehavior.Merge

			switch (_behavior) {
				case SetFilterBehavior.Merge:
					return unionWith(getFiltersPermanent(), value, prev)
				case SetFilterBehavior.Replace:
					return unionWith(getFiltersPermanent(), value)
				default:
					throw new Error('No')
			}
		})
	}
}

export interface GetSortersProps {
	sortersFromResource: Sorters | undefined
	sortersFromProp: Sorters | undefined
	sortersPermanentFromProp: SortersOptions['permanent']
	syncRouteFromProp: boolean | undefined
}

const DEFAULT_SORTERS: Sorters = []

export function getSorters(
	{
		sortersFromResource,
		sortersFromProp,
		sortersPermanentFromProp,
		syncRouteFromProp,
	}: GetSortersProps,
): Sorters {
	const initial = syncRouteFromProp
		? sortersFromResource ?? sortersFromProp
		: sortersFromProp

	return resolveSorters(
		sortersPermanentFromProp,
		initial,
	) ?? DEFAULT_SORTERS
}

export interface CreateSetSortersFnProps {
	getSortersPermanent: () => SortersOptions['permanent']
	update: (getter: (prev: Sorters) => Sorters) => void
}

export type SetSortersFn = (
	value: Sorters | ((prev: Sorters) => Sorters),
) => void

export function createSetSortersFn(
	{
		getSortersPermanent,
		update,
	}: CreateSetSortersFnProps,
): SetSortersFn {
	return function setSorters(value) {
		update((prev) => {
			const nextValue = typeof value === 'function' ? value(prev) : value
			return resolveSorters(getSortersPermanent(), nextValue)
		})
	}
}

export interface GetPaginationForQueryProps {
	paginationModeFromProp: PaginationProp['mode']
	currentPage: number
	perPage: number
}

export function getPaginationForQuery(
	{
		paginationModeFromProp,
		currentPage,
		perPage,
	}: GetPaginationForQueryProps,
): Pagination<number> | undefined {
	switch (paginationModeFromProp) {
		case undefined:
		case 'server':
			return {
				current: currentPage,
				perPage,
			}
	}
}

export interface GetSortersForQuery {
	sortersModeFromProp: SortersOptions['mode']
	sorters: Sorters
}

export function getSortersForQuery(
	{
		sortersModeFromProp,
		sorters,
	}: GetSortersForQuery,
): Sorters | undefined {
	switch (sortersModeFromProp) {
		case undefined:
		case 'server':
			return sorters
	}
}

export interface GetFiltersForQuery {
	filtersModeFromProp: FiltersOptions['mode'] | undefined
	filters: Filters
}

export function getFiltersForQuery(
	{
		filtersModeFromProp,
		filters,
	}: GetFiltersForQuery,
) {
	switch (filtersModeFromProp) {
		case undefined:
		case 'server':
			return filters // TODO: 移除 filtersFromProp.permanent 內的值
	}
}

export interface GetPageCountProps<
	TResultData extends BaseRecord,
> {
	perPage: number
	queryData: GetListResult<TResultData, number> | undefined
}

export function getPageCount<
	TResultData extends BaseRecord,
>(
	{
		perPage,
		queryData,
	}: GetPageCountProps<TResultData>,
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
	syncRouteFromProp: boolean | undefined

	currentPageResource: TPageParam | undefined
	perPageResource: number | undefined
	sortersResource: Sorters | undefined
	filtersResource: Filters | undefined

	currentPage: TPageParam
	perPage: number
	sorters: Sorters
	filters: Filters
}

export function toRouterGoParams<
	TPageParam,
>(
	{
		syncRouteFromProp,

		currentPageResource,
		perPageResource,
		sortersResource,
		filtersResource,

		currentPage,
		perPage,
		sorters,
		filters,
	}: ToRouterGoParamsProps<TPageParam>,
): RouterGoParams | false {
	if (!syncRouteFromProp)
		return false

	if ([
		[currentPageResource, currentPage],
		[perPageResource, perPage],
		[sortersResource, sorters],
		[filtersResource, filters],
	].every(([a, b]) => isEqual(a, b)))
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

export function resolveSorters(
	permanent: Sorters | undefined,
	value: Sorters,
): Sorters
export function resolveSorters(
	permanent: Sorters | undefined,
	value: Sorters | undefined,
): Sorters | undefined
export function resolveSorters(
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
		left.operator !== FilterOperator.and
		&& left.operator !== FilterOperator.or
		&& right.operator !== FilterOperator.and
		&& right.operator !== FilterOperator.or
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
		&& (filter.operator !== FilterOperator.or
			|| (filter.operator === FilterOperator.or
				&& filter.value.length !== 0))
		&& (filter.operator !== FilterOperator.and
			|| (filter.operator === FilterOperator.and
				&& filter.value.length !== 0))
}

export function resolveFilters(
	permanent: Filters | undefined,
	value: Filters,
	prev?: Filters
): Filters
export function resolveFilters(
	permanent: Filters | undefined,
	value: Filters | undefined,
	prev?: Filters
): Filters | undefined
export function resolveFilters(
	permanent: Filters | undefined,
	value: Filters | undefined,
	prev?: Filters,
): Filters | undefined {
	if (permanent || value) {
		return unionWith(permanent, value, prev, compareFilter)
			.filter(filterFilter)
	}
}

function getSubValue<
	TProp,
	TResult,
>(
	{
		prop,
		path,
		prev,
		isValue,
	}: {
		prop: TProp | undefined
		path: string
		prev?: TResult
		isValue?: (prop: TProp) => boolean
	},
): TResult | undefined {
	const current = prop == null
		? undefined
		: isValue?.(prop)
			? prop
			: get(prop, path)

	return isEqual(current, prev)
		? prev
		: current
}

function checkFiltersValue(
	value: FiltersProp,
): value is Filters {
	return Array.isArray(value)
}

function checkSortersValue(
	value: SortersProp,
): value is Sorters {
	return Array.isArray(value)
}
