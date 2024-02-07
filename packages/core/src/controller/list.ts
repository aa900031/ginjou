import type { Simplify, ValueOf } from 'type-fest'
import { get, isEqual, unionWith } from 'lodash-unified'
import type { RouterGoParams } from '../router'
import { RouterGoType } from '../router'
import type { BaseRecord, Filter, Filters, GetList, GetListResult, Pagination, PaginationPayload, Sort, Sorters } from '../query'
import { FilterOperator } from '../query'
import type { ResolvedResource } from '../resource'

export type PaginationProp<
	TPageParam,
> = Simplify<
	& PaginationPayload<TPageParam>
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
	TPageParam,
> = Simplify<
	& GetList.Props<TData, TError, TResultData, TPageParam>
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

export function getPropCurrentPage<TPageParam>(
	{
		prop,
		prev,
	}: GetPropCurrentPageProps<TPageParam>,
): PaginationProp<TPageParam>['current'] {
	return getPropValue({
		path: 'current',
		prop,
		prev,
	})
}

export interface GetPropPerPageProps<
	TPageParam,
> {
	prop: PaginationProp<TPageParam> | undefined
	prev?: PaginationProp<TPageParam>['perPage']
}

export function getPropPerPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetPropPerPageProps<TPageParam>,
): PaginationProp<TPageParam>['perPage'] {
	return getPropValue({
		path: 'perPage',
		prop,
		prev,
	})
}

export interface GetPropPaginationModeProps {
	prop: PaginationProp<any> | undefined
	prev?: PaginationProp<any>['mode']
}

export function getPropPaginationMode(
	{
		prop,
		prev,
	}: GetPropPaginationModeProps,
): PaginationProp<any>['mode'] {
	return getPropValue({
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
	return getPropValue({
		path: 'value',
		prop,
		prev,
		isValue: checkFiltersValue,
		getFromProp: true,
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
	return getPropValue({
		path: 'permanent',
		prop,
		prev,
		isValue: checkFiltersValue,
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
	return getPropValue({
		path: 'behavior',
		prop,
		prev,
		isValue: checkFiltersValue,
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
	return getPropValue({
		path: 'mode',
		prop,
		prev,
		isValue: checkFiltersValue,
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
	return getPropValue({
		path: 'value',
		prop,
		prev,
		isValue: checkSortersValue,
		getFromProp: true,
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
	return getPropValue({
		path: 'permanent',
		prop,
		prev,
		isValue: checkSortersValue,
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
	return getPropValue({
		prop,
		path: 'mode',
		prev,
		isValue: checkSortersValue,
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
	return getPropValue({
		path: 'params.pagination.current',
		prop,
		prev,
	})
}

export interface GetResourcePerPageProps<
	TPageParam,
> {
	prop: ResolvedResource | undefined
	prev?: Pagination<TPageParam>['perPage']
}

export function getResourcePerPage<
	TPageParam,
>(
	{
		prop,
		prev,
	}: GetResourcePerPageProps<TPageParam>,
): number | undefined {
	return getPropValue({
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
	return getPropValue({
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
	return getPropValue({
		path: 'params.sorters',
		prop,
		prev,
	})
}

export interface GetCurrentPageProps<
	TPageParam,
> {
	currentPageFromProp: PaginationProp<TPageParam>['current'] | undefined
	currentPageFromResource: PaginationProp<TPageParam>['current'] | undefined
	syncRouteFromProp: boolean | undefined
}

export function getCurrentPage<
	TPageParam,
>(
	{
		currentPageFromProp,
		currentPageFromResource,
		syncRouteFromProp,
	}: GetCurrentPageProps<TPageParam>,
): Pagination<TPageParam>['current'] {
	if (syncRouteFromProp) {
		return currentPageFromResource
			?? currentPageFromProp
			?? 1 as TPageParam
	}
	else {
		return currentPageFromProp
			?? 1 as TPageParam
	}
}

export interface GetPerPageProps<
	TPageParam,
> {
	perPageFromProp: PaginationProp<TPageParam>['perPage'] | undefined
	perPageFromResource: PaginationProp<TPageParam>['perPage'] | undefined
	syncRouteFromProp: boolean | undefined
}

export function getPerPage<
	TPageParam,
>(
	{
		perPageFromProp,
		perPageFromResource,
		syncRouteFromProp,
	}: GetPerPageProps<TPageParam>,
): Pagination<TPageParam>['perPage'] {
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

function getValue<T>(
	current: T | undefined,
	prev?: T,
): T | undefined {
	if (prev != null) {
		if (
			current == null
			|| isEqual(current, prev)
		)
			return prev
	}
	return current
}

function getPropValue<
	TProp,
	TResult,
>(
	{
		prop,
		path,
		isValue,
		prev,
		getFromProp,
	}: {
		prop: TProp | undefined
		path: string
		isValue?: (prop: TProp) => boolean
		prev?: TResult
		getFromProp?: boolean
	},
): TResult | undefined {
	const current = prop == null
		? undefined
		: isValue?.(prop)
			? (getFromProp === true ? prop : undefined)
			: get(prop, path)

	return getValue(current, prev)
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
