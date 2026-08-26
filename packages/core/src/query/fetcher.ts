import type { MutationFunctionContext, QueryFunctionContext } from '@tanstack/query-core'
import type { ValueOf } from 'type-fest'

export type Meta = Record<any, any>

export type Params = Record<any, any>

export type RecordKey = string | number

export interface BaseRecord {
	id?: RecordKey
	[key: string]: any
}

export const SortOrder = {
	Asc: 'asc',
	Desc: 'desc',
} as const

export type SortOrderValues = ValueOf<typeof SortOrder>

export function isSortOrder(
	value: unknown,
): value is SortOrderValues {
	switch (value) {
		case SortOrder.Asc:
		case SortOrder.Desc:
			return true
		default:
			return false
	}
}

export interface Sort {
	field: string
	order: SortOrderValues
}

export type Sorters = Sort[]

export interface SorterMatcher {
	field: string
	order?: SortOrderValues
}

export function isTargetSorter(
	item: Sort,
	matcher: SorterMatcher,
): boolean {
	return item.field === matcher.field
		&& (matcher.order === undefined || item.order === matcher.order)
}

export function filterSorters(
	items: Sorters,
	matcher: SorterMatcher,
): Sorters {
	return items.filter(item => isTargetSorter(item, matcher))
}

export function findSorter(
	items: Sorters,
	matcher: SorterMatcher,
): Sort | undefined {
	return items.find(item => isTargetSorter(item, matcher))
}

export interface Pagination<
	TPageParam = number,
> {
	current: TPageParam
	perPage: number
}

export const FilterOperator = {
	eq: 'eq',
	ne: 'ne',
	lt: 'lt',
	gt: 'gt',
	lte: 'lte',
	gte: 'gte',
	in: 'in',
	nin: 'nin',
	contains: 'contains',
	ncontains: 'ncontains',
	containss: 'containss',
	ncontainss: 'ncontainss',
	between: 'between',
	nbetween: 'nbetween',
	null: 'null',
	nnull: 'nnull',
	startswith: 'startswith',
	nstartswith: 'nstartswith',
	startswiths: 'startswiths',
	nstartswiths: 'nstartswiths',
	endswith: 'endswith',
	nendswith: 'nendswith',
	endswiths: 'endswiths',
	nendswiths: 'nendswiths',
	or: 'or',
	and: 'and',
} as const

export type FilterOperatorValues = ValueOf<typeof FilterOperator>

export interface LogicalFilter {
	field: string
	operator: Exclude<FilterOperatorValues, 'or' | 'and'>
	value: any
}

export interface ConditionalFilter {
	key?: string
	operator: Extract<FilterOperatorValues, 'or' | 'and'>
	value: (LogicalFilter | ConditionalFilter)[]
}

export type Filter = (LogicalFilter | ConditionalFilter)

export type Filters = Filter[]

export function isLogicalFilter(
	item: Filter,
): item is LogicalFilter {
	return isLogicalFilterOperator(item.operator)
}

export function isConditionalFilter(
	item: Filter,
): item is ConditionalFilter {
	return isConditionalFilterOperator(item.operator)
}

export interface FilterMatcher {
	field: string
	operator?: FilterOperatorValues
}

export function isTargetFilter(
	item: Filter,
	matcher: FilterMatcher,
): boolean {
	return isLogicalFilter(item)
		&& item.field === matcher.field
		&& (matcher.operator === undefined || item.operator === matcher.operator)
}

export function filterFilters(
	items: Filters,
	matcher: FilterMatcher,
	options?: {
		deep?: boolean
	},
): Filters {
	const result: Filters = []

	for (const item of items) {
		if (options?.deep && isConditionalFilter(item)) {
			const value = filterFilters(item.value, matcher, options)
			if (value.length)
				result.push({ ...item, value })
		}
		else if (isTargetFilter(item, matcher)) {
			result.push(item)
		}
	}

	return result
}

export function findFilter(
	items: Filters,
	matcher: FilterMatcher,
	options?: {
		deep?: boolean
	},
): Filter | undefined {
	for (const item of items) {
		if (options?.deep && isConditionalFilter(item)) {
			const result = findFilter(item.value, matcher, options)
			if (result)
				return result
		}
		else if (isTargetFilter(item, matcher)) {
			return item
		}
	}
}

export function isFilterOperator(
	operator: unknown,
): operator is FilterOperatorValues {
	return (Object.values(FilterOperator) as unknown[]).includes(operator)
}

export function isConditionalFilterOperator(
	operator: unknown,
): operator is ConditionalFilter['operator'] {
	switch (operator) {
		case FilterOperator.and:
		case FilterOperator.or:
			return true
		default:
			return false
	}
}

export function isLogicalFilterOperator(
	operator: unknown,
): operator is LogicalFilter['operator'] {
	return !isConditionalFilterOperator(operator) && isFilterOperator(operator)
}

export interface CursorOnlyNext<
	TPageParam,
> {
	prev?: undefined
	next: TPageParam
}

export interface CursorOnlyPrev<
	TPageParam,
> {
	prev: TPageParam
	next?: undefined
}

export interface CursorBi<
	TPageParam,
> {
	prev: TPageParam
	next: TPageParam
}

export type Cursor<
	TPageParam,
>
	= | CursorOnlyNext<TPageParam>
		| CursorOnlyPrev<TPageParam>
		| CursorBi<TPageParam>

export interface CreateOneProps<
	TParams extends Params,
> {
	resource: string
	params: TParams
	meta?: Meta
}

export interface CreateOneResult<
	TData extends BaseRecord,
> {
	data: TData
}

export type CreateOneFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: CreateOneProps<TParams>,
	context?: MutationFunctionContext,
) => Promise<CreateOneResult<TData>>

export interface CreateManyProps<
	TParams extends Params,
> {
	resource: string
	params: TParams[]
	meta?: Meta
}

export interface CreateManyResult<
	TData extends BaseRecord,
> {
	data: TData[]
}

export type CreateManyFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: CreateManyProps<TParams>,
	context?: MutationFunctionContext,
) => Promise<CreateManyResult<TData>>

export interface DeleteManyProps<
	TParams extends Params,
> {
	resource: string
	ids: RecordKey[]
	params?: TParams
	meta?: Meta
}

export interface DeleteManyResult<
	TData extends BaseRecord,
> {
	data: TData[]
}

export type DeleteManyFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: DeleteManyProps<TParams>,
	context?: MutationFunctionContext,
) => Promise<DeleteManyResult<TData>>

export interface DeleteOneProps<
	TParams extends Params,
> {
	resource: string
	id: RecordKey
	params?: TParams
	meta?: Meta
}

export interface DeleteOneResult<
	TData extends BaseRecord,
> {
	data: TData
}

export type DeleteOneFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: DeleteOneProps<TParams>,
	context?: MutationFunctionContext,
) => Promise<DeleteOneResult<TData>>

export interface CustomProps<
	TQuery extends Params,
	TPayload extends Params,
> {
	url: string
	method:
		| 'get'
		| 'delete'
		| 'head'
		| 'options'
		| 'post'
		| 'put'
		| 'patch'
	sorters?: Sorters
	filters?: Filters
	payload?: TPayload
	query?: TQuery
	headers?: Record<string, any>
	meta?: Meta
}

export interface CustomResult<
	TData extends BaseRecord,
> {
	data: TData
}

export type CustomFn<
	TData extends BaseRecord,
	TQuery extends Params,
	TPayload extends Params,
> = (
	props: CustomProps<TQuery, TPayload>,
	context?: QueryFunctionContext | MutationFunctionContext,
) => Promise<CustomResult<TData>>

export interface UpdateOneResult<
	TData extends BaseRecord,
> {
	data: TData
}

export interface UpdateOneProps<
	TParams extends Params,
> {
	resource: string
	id: RecordKey
	params: TParams
	meta?: Meta
}

export type UpdateOneFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: UpdateOneProps<TParams>,
	context?: MutationFunctionContext,
) => Promise<UpdateOneResult<TData>>

export interface UpdateManyProps<
	TParams extends Params,
> {
	resource: string
	ids: RecordKey[]
	params: TParams
	meta?: Meta
}

export interface UpdateManyResult<
	TData extends BaseRecord,
> {
	data: TData[]
}

export type UpdateManyFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: UpdateManyProps<TParams>,
	context?: MutationFunctionContext,
) => Promise<UpdateManyResult<TData>>

export interface GetOneProps {
	resource: string
	id: RecordKey
	meta?: Meta
}

export interface GetOneResult<
	TData extends BaseRecord,
> {
	data: TData
}

export type GetOneFn<
	TData extends BaseRecord,
> = (
	props: GetOneProps,
	context?: QueryFunctionContext,
) => Promise<GetOneResult<TData>>

export interface GetManyProps {
	resource: string
	ids: RecordKey[]
	meta?: Meta
}

export interface GetManyResult<
	TData extends BaseRecord,
> {
	data: TData[]
}

export type GetManyFn<
	TData extends BaseRecord,
> = (
	props: GetManyProps,
	context?: QueryFunctionContext,
) => Promise<GetManyResult<TData>>

export interface GetListProps<
	TPageParam,
> {
	resource: string
	pagination?: Pagination<TPageParam>
	sorters?: Sorters
	filters?: Filters
	meta?: Meta
}

export interface BaseGetListResult<
	TData extends BaseRecord,
> {
	data: TData[]
	total: number
}

export interface GetInfiniteListResult<
	TData extends BaseRecord,
	TPageParam,
> extends BaseGetListResult<TData> {
	pagination?: Pagination<TPageParam>
	cursor?: Cursor<TPageParam>
}

export type GetListResult<
	TData extends BaseRecord,
	TPageParam,
>
	= | BaseGetListResult<TData>
		| GetInfiniteListResult<TData, TPageParam>

export type GetListFn<
	TData extends BaseRecord,
	TPageParam,
> = (
	props: GetListProps<TPageParam>,
	context?: QueryFunctionContext,
) => Promise<GetListResult<TData, TPageParam>>

export interface Fetcher {
	getList?: GetListFn<any, any>
	getMany?: GetManyFn<any>
	getOne?: GetOneFn<any>
	createOne?: CreateOneFn<any, any>
	createMany?: CreateManyFn<any, any>
	updateOne?: UpdateOneFn<any, any>
	updateMany?: UpdateManyFn<any, any>
	deleteOne?: DeleteOneFn<any, any>
	deleteMany?: DeleteManyFn<any, any>
	custom?: CustomFn<any, any, any>
}

/* @__NO_SIDE_EFFECTS__ */
export function defineFetcher<
	T extends Fetcher,
>(
	value: T,
): T {
	return value
}
