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

export type SortOrderType = ValueOf<typeof SortOrder>

export interface Sort {
	field: string
	order: SortOrderType
}

export type Sorters = Sort[]

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

export type FilterOperatorType = ValueOf<typeof FilterOperator>

export interface LogicalFilter {
	field: string
	operator: Exclude<FilterOperatorType, 'or' | 'and'>
	value: any
}

export interface ConditionalFilter {
	key?: string
	operator: Extract<FilterOperatorType, 'or' | 'and'>
	value: (LogicalFilter | ConditionalFilter)[]
}

export type Filter = (LogicalFilter | ConditionalFilter)

export type Filters = Filter[]

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

export interface CreateProps<
	TParams extends Params,
> {
	resource: string
	params: TParams
	meta?: Meta
}

export interface CreateResult<
	TData extends BaseRecord,
> {
	data: TData
}

export type CreateOneFn<
	TData extends BaseRecord,
	TParams extends Params,
> = (
	props: CreateProps<TParams>,
	context: MutationFunctionContext,
) => Promise<CreateResult<TData>>

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
	context: MutationFunctionContext,
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
	context: MutationFunctionContext,
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
	context: MutationFunctionContext,
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
	context: QueryFunctionContext | MutationFunctionContext,
) => Promise<CustomResult<TData>>

export interface UpdateResult<
	TData extends BaseRecord,
> {
	data: TData
}

export interface UpdateProps<
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
	props: UpdateProps<TParams>,
	context: MutationFunctionContext,
) => Promise<UpdateResult<TData>>

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
	context: MutationFunctionContext,
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
	context: QueryFunctionContext,
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
	context: QueryFunctionContext,
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
	context: QueryFunctionContext,
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
