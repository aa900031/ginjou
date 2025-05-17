import type { Simplify, ValueOf } from 'type-fest'
import type { BaseRecord, Filter, Filters, GetList, GetListResult, Pagination, Sort, Sorters } from '../query'
import type { ResolvedResource } from '../resource'
import type { RouterGoParams, RouterLocation } from '../router'
import { isEqual, unionWith } from 'lodash-unified'
import { FilterOperator } from '../query'
import { RouterGoType } from '../router'
import { getSubValue } from '../utils/sub-value'

export type PaginationProp<
	TPageParam,
> = Simplify<
	& Partial<Pagination<TPageParam>>
	& {
		mode?: 'client' | 'server' | 'off'
		init?: TPageParam
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
	TPageParam,
> = Simplify<
	& Omit<
		GetList.Props<TData, TError, TResultData, TPageParam>,
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

export interface GetPropCurrentPageProps<
	TPageParam,
> {
	prop: PaginationProp<TPageParam> | undefined
	prev?: PaginationProp<TPageParam>['current']
}

export function getPropCurrentPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetPropCurrentPageProps<TPageParam>,
): PaginationProp<TPageParam>['current'] {
	return getSubValue({
		path: 'current',
		prop,
		prev,
	})
}

export interface GetPropPerPageProps {
	prop: PaginationProp<unknown> | undefined
	prev?: PaginationProp<unknown>['perPage']
}

export function getPropPerPage(
	{
		prop,
		prev,
	}: GetPropPerPageProps,
): PaginationProp<unknown>['perPage'] {
	return getSubValue({
		path: 'perPage',
		prop,
		prev,
	})
}

export interface GetPropPaginationModeProps {
	prop: PaginationProp<unknown> | undefined
	prev?: PaginationProp<unknown>['mode']
}

export function getPropPaginationMode(
	{
		prop,
		prev,
	}: GetPropPaginationModeProps,
): PaginationProp<unknown>['mode'] {
	return getSubValue({
		path: 'mode',
		prop,
		prev,
	})
}

export interface GetPropInitialPageProps<
	TPageParam,
> {
	prop: PaginationProp<TPageParam> | undefined
	prev?: PaginationProp<TPageParam>['init']
}

export function getPropInitialPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetPropInitialPageProps<TPageParam>,
): PaginationProp<TPageParam>['init'] {
	return getSubValue({
		path: 'init',
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

export interface GetResourceCurrentPageProps<
	TPageParam,
> {
	prop: ResolvedResource | undefined
	prev?: Pagination<TPageParam>['current']
}

export function getResourceCurrentPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetResourceCurrentPageProps<TPageParam>,
): TPageParam | undefined {
	return getSubValue({
		path: 'params.pagination.current',
		prop,
		prev,
	})
}

export interface GetResourcePerPageProps {
	prop: ResolvedResource | undefined
	prev?: Pagination<unknown>['perPage']
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

export interface GetLocationCurrentPageProps {
	location: RouterLocation | undefined
	syncRouteFromProp: boolean | undefined
}

export function getLocationCurrentPage<
	TPageParam,
>(
	{
		location,
		syncRouteFromProp,
	}: GetLocationCurrentPageProps,
): TPageParam | undefined {
	if (syncRouteFromProp !== true)
		return

	const current = location?.query?.current
	if (typeof current !== 'string')
		return

	return Number.isNaN(current)
		? current as TPageParam
		: +current as TPageParam
}

export interface GetLocationPerPageProps {
	location: RouterLocation | undefined
	syncRouteFromProp: boolean | undefined
}

export function getLocationPerPage(
	{
		location,
		syncRouteFromProp,
	}: GetLocationPerPageProps,
): number | undefined {
	if (syncRouteFromProp !== true)
		return

	const perPage = location?.query?.perPage
	if (typeof perPage !== 'string' || Number.isNaN(+perPage))
		return

	return +perPage
}

export interface GetLocationFiltersProps {
	location: RouterLocation | undefined
	syncRouteFromProp: boolean | undefined
}

export function getLocationFilters(
	{
		location,
		syncRouteFromProp,
	}: GetLocationFiltersProps,
): Filters | undefined {
	if (syncRouteFromProp !== true)
		return

	const filters = location?.query?.filters
	if (typeof filters !== 'string')
		return

	return JSON.parse(filters)
}

export interface GetLocationSortersProps {
	location: RouterLocation | undefined
	syncRouteFromProp: boolean | undefined
}

export function getLocationSorters(
	{
		location,
		syncRouteFromProp,
	}: GetLocationSortersProps,
): Sorters | undefined {
	if (syncRouteFromProp !== true)
		return

	const sorters = location?.query?.sorters
	if (typeof sorters !== 'string')
		return

	return JSON.parse(sorters)
}

export interface GetInitialPageProps<
	TPageParam,
> {
	initalPageFromProp: PaginationProp<TPageParam>['init']
}

export function getInitialPage<
	TPageParam,
>(
	{
		initalPageFromProp,
	}: GetInitialPageProps<TPageParam>,
) {
	return initalPageFromProp
		?? 1 as TPageParam
}

export interface GetCurrentPageProps<
	TPageParam,
> {
	initalPageFromProp: TPageParam | undefined
	currentPageFromProp: PaginationProp<TPageParam>['current'] | undefined
	currentPageFromResource: PaginationProp<TPageParam>['current'] | undefined
	currentPageFromLocation: PaginationProp<TPageParam>['current'] | undefined
	syncRouteFromProp: boolean | undefined
}

export function getCurrentPage<
	TPageParam,
>(
	{
		initalPageFromProp,
		currentPageFromProp,
		currentPageFromResource,
		currentPageFromLocation,
		syncRouteFromProp,
	}: GetCurrentPageProps<TPageParam>,
): Pagination<TPageParam>['current'] {
	if (syncRouteFromProp) {
		return currentPageFromResource
			?? currentPageFromLocation
			?? currentPageFromProp
			?? getInitialPage({
				initalPageFromProp,
			})
	}
	else {
		return currentPageFromProp
			?? getInitialPage({
				initalPageFromProp,
			})
	}
}

export interface GetPerPageProps<
	TPageParam,
> {
	perPageFromProp: PaginationProp<TPageParam>['perPage'] | undefined
	perPageFromResource: PaginationProp<TPageParam>['perPage'] | undefined
	perPageFromLocation: PaginationProp<TPageParam>['perPage'] | undefined
	syncRouteFromProp: boolean | undefined
}

export function getPerPage<
	TPageParam,
>(
	{
		perPageFromProp,
		perPageFromResource,
		perPageFromLocation,
		syncRouteFromProp,
	}: GetPerPageProps<TPageParam>,
): Pagination<TPageParam>['perPage'] {
	if (syncRouteFromProp) {
		return perPageFromResource
			?? perPageFromLocation
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
	filtersFromLocation: Filters | undefined
	filtersFromProp: Filters | undefined
	filtersPermanentFromProp: FiltersOptions['permanent'] | undefined
	syncRouteFromProp: boolean | undefined
}

const DEFAULT_FILTERS: Filters = []

export function getFilters(
	{
		filtersFromResource,
		filtersFromLocation,
		filtersFromProp,
		filtersPermanentFromProp,
		syncRouteFromProp,
	}: GetFiltersProps,
): Filters {
	const value = syncRouteFromProp
		? filtersFromResource ?? filtersFromLocation ?? filtersFromProp
		: filtersFromProp

	return resolveFilters(
		filtersPermanentFromProp,
		value,
	) ?? DEFAULT_FILTERS
}

export interface CreateSetFiltersFnProps {
	getFiltersPermanent: () => FiltersOptions['permanent']
	getFiltersBehavior: () => FiltersOptions['behavior']
	getPrev: () => Filters | undefined
	update: (nextValue: Filters) => void
}

export const SetFilterBehavior = {
	Replace: 'replace',
	Merge: 'merge',
} as const

export type SetFilterBehaviorType = ValueOf<typeof SetFilterBehavior>

export type SetFiltersFn = (
	value: Filters | ((prev: Filters | undefined) => Filters),
	behavior?: SetFilterBehaviorType
) => void

export function createSetFiltersFn(
	{
		getFiltersPermanent,
		getFiltersBehavior,
		getPrev,
		update,
	}: CreateSetFiltersFnProps,
): SetFiltersFn {
	return function setFilters(value, behavior) {
		const prev = getPrev()

		let nextValue: Filters
		if (typeof value === 'function') {
			nextValue = resolveFilters(getFiltersPermanent(), value(prev))
		}
		else {
			const _behavior = behavior
				?? getFiltersBehavior()
				?? SetFilterBehavior.Merge

			switch (_behavior) {
				case SetFilterBehavior.Merge:
					nextValue = resolveFilters(getFiltersPermanent(), value, prev, true)
					break
				case SetFilterBehavior.Replace:
					nextValue = resolveFilters(getFiltersPermanent(), value)
					break
				default:
					throw new Error('No')
			}
		}

		if (
			nextValue == null
			|| (prev != null && isEqual(prev, nextValue))
		) {
			return
		}

		update(nextValue)
	}
}

export interface GetSortersProps {
	sortersFromResource: Sorters | undefined
	sortersFromLocation: Sorters | undefined
	sortersFromProp: Sorters | undefined
	sortersPermanentFromProp: SortersOptions['permanent']
	syncRouteFromProp: boolean | undefined
}

const DEFAULT_SORTERS: Sorters = []

export function getSorters(
	{
		sortersFromResource,
		sortersFromLocation,
		sortersFromProp,
		sortersPermanentFromProp,
		syncRouteFromProp,
	}: GetSortersProps,
): Sorters {
	const initial = syncRouteFromProp
		? sortersFromResource ?? sortersFromLocation ?? sortersFromProp
		: sortersFromProp

	return resolveSorters(
		sortersPermanentFromProp,
		initial,
	) ?? DEFAULT_SORTERS
}

export interface CreateSetSortersFnProps {
	getSortersPermanent: () => SortersOptions['permanent']
	getPrev: () => Sorters | undefined
	update: (nextValue: Sorters) => void
}

export type SetSortersFn = (
	value: Sorters | ((prev: Sorters | undefined) => Sorters),
) => void

export function createSetSortersFn(
	{
		getSortersPermanent,
		getPrev,
		update,
	}: CreateSetSortersFnProps,
): SetSortersFn {
	return function setSorters(value) {
		const prev = getPrev()
		const generated = typeof value === 'function' ? value(prev) : value
		const nextValue = resolveSorters(getSortersPermanent(), generated)
		if (
			nextValue == null
			|| (prev != null && isEqual(prev, nextValue))
		) {
			return
		}

		update(nextValue)
	}
}

export interface GetPaginationForQueryProps<
	TPageParam,
> {
	paginationModeFromProp: PaginationProp<TPageParam>['mode']
	currentPage: TPageParam
	perPage: number
}

export function getPaginationForQuery<
	TPageParam,
>(
	{
		paginationModeFromProp,
		currentPage,
		perPage,
	}: GetPaginationForQueryProps<TPageParam>,
): Pagination<TPageParam> | undefined {
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
	].every(([a, b]) => isEqual(a, b))) {
		return false
	}

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
	if (permanent == null && value == null)
		return

	const result = unionWith(
		permanent,
		value,
		compareSort,
	).filter(filterSort)

	if (result.length === 0)
		return DEFAULT_SORTERS

	return result
}

export interface GetRecordsProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	paginationModeFromProp: PaginationProp<TPageParam>['mode']
	currentPage: TPageParam | undefined
	perPage: number | undefined
	queryData: GetListResult<TResultData, TPageParam> | undefined
}

export function getRecords<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		paginationModeFromProp,
		currentPage,
		perPage,
		queryData,
	}: GetRecordsProps<TResultData, TPageParam>,
): GetListResult<TResultData, TPageParam>['data'] | undefined {
	if (
		paginationModeFromProp !== 'client'
		|| currentPage == null
		|| perPage == null
	) {
		return queryData?.data
	}

	return queryData?.data.slice(
		(currentPage as unknown as number - 1) * perPage,
		currentPage as unknown as number * perPage,
	)
}

export interface GetTotalProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	queryData: GetListResult<TResultData, TPageParam> | undefined
}

export function getTotal<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		queryData,
	}: GetTotalProps<TResultData, TPageParam>,
): number | undefined {
	return queryData?.total
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
	prev?: Filters,
	isMerge?: boolean,
): Filters
export function resolveFilters(
	permanent: Filters | undefined,
	value: Filters | undefined,
	prev?: Filters,
	isMerge?: boolean,
): Filters | undefined
export function resolveFilters(
	permanent: Filters | undefined,
	value: Filters | undefined,
	prev?: Filters,
	isMerge?: boolean,
): Filters | undefined {
	const result = unionWith(
		permanent,
		value,
		isMerge ? prev : undefined,
		compareFilter,
	).filter(filterFilter)

	if (result.length === 0)
		return DEFAULT_FILTERS

	return result
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
