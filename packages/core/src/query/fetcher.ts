import type { ValueOf } from 'type-fest'

export type Meta = Record<string | number | symbol, unknown>

export type RecordKey = string | number

export type BaseRecord = {
	id?: RecordKey | null
} & Partial<Record<string, any>>

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
	TPageParam = number,
> {
	prev?: undefined
	next: TPageParam
}

export interface CursorOnlyPrev<
	TPageParam = number,
> {
	prev: TPageParam
	next?: undefined
}

export interface CursorBi<
	TPageParam = number,
> {
	prev: TPageParam
	next: TPageParam
}

export type Cursor<
	TPageParam = number,
>
	= | CursorOnlyNext<TPageParam>
		| CursorOnlyPrev<TPageParam>
		| CursorBi<TPageParam>

export interface CreateProps<
	TParams = Record<string, any>,
> {
	resource: string
	params: TParams
	meta?: Meta
}

export interface CreateResult<
	TData = BaseRecord,
> {
	data: TData
}

export type CreateOneFn = <
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(props: CreateProps<TParams>,
) => Promise<CreateResult<TData>>

export interface CreateManyProps<
	TParams = Record<string, any>,
> {
	resource: string
	params: TParams[]
	meta?: Meta
}

export interface CreateManyResult<
	TData = BaseRecord,
> {
	data: TData[]
}

export type CreateManyFn = <
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(props: CreateManyProps<TParams>,
) => Promise<CreateManyResult<TData>>

export interface DeleteManyProps<
	TParams = Record<string, any>,
> {
	resource: string
	ids: RecordKey[]
	params?: TParams
	meta?: Meta
}

export interface DeleteManyResult<
	TData = BaseRecord,
> {
	data: TData[]
}

export type DeleteManyFn = <
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(props: DeleteManyProps<TParams>,
) => Promise<DeleteManyResult<TData>>

export interface DeleteOneProps<
	TParams = Record<string, any>,
> {
	resource: string
	id: RecordKey
	params?: TParams
	meta?: Meta
}

export interface DeleteOneResult<
	TData = BaseRecord,
> {
	data: TData
}

export type DeleteOneFn = <
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(props: DeleteOneProps<TParams>,
) => Promise<DeleteOneResult<TData>>

export interface CustomProps<
	TQuery = unknown,
	TPayload = unknown,
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
	TData = BaseRecord,
> {
	data: TData
}

export type CustomFn = <
	TData extends BaseRecord = BaseRecord,
	TQuery = unknown,
	TPayload = unknown,
>(props: CustomProps<TQuery, TPayload>,
) => Promise<CustomResult<TData>>

export interface UpdateResult<
	TData extends BaseRecord = BaseRecord,
> {
	data: TData
}

export interface UpdateProps<
	TParams = Record<string, any>,
> {
	resource: string
	id: RecordKey
	params: TParams
	meta?: Meta
}

export type UpdateOneFn = <
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(props: UpdateProps<TParams>,
) => Promise<UpdateResult<TData>>

export interface UpdateManyProps<
	TParams = Record<string, any>,
> {
	resource: string
	ids: RecordKey[]
	params: TParams
	meta?: Meta
}

export interface UpdateManyResult<
	TData extends BaseRecord = BaseRecord,
> {
	data: TData[]
}

export type UpdateManyFn = <
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(props: UpdateManyProps<TParams>,
) => Promise<UpdateManyResult<TData>>

export interface GetOneProps {
	resource: string
	id: RecordKey
	meta?: Meta
}

export interface GetOneResult<
	TData extends BaseRecord = BaseRecord,
> {
	data: TData
}

export type GetOneFn = <
	TData extends BaseRecord = BaseRecord,
>(props: GetOneProps,
) => Promise<GetOneResult<TData>>

export interface GetManyProps {
	resource: string
	ids: RecordKey[]
	meta?: Meta
}

export interface GetManyResult<
	TData extends BaseRecord = BaseRecord,
> {
	data: TData[]
}

export type GetManyFn = <
	TData extends BaseRecord = BaseRecord,
>(props: GetManyProps,
) => Promise<GetManyResult<TData>>

export interface GetListProps<
	TPageParam = number,
> {
	resource: string
	pagination?: Pagination<TPageParam>
	sorters?: Sorters
	filters?: Filters
	meta?: Meta
}

export interface BaseGetListResult<
	TData extends BaseRecord = BaseRecord,
> {
	data: TData[]
	total: number
}

export interface GetInfiniteListResult<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
> extends BaseGetListResult<TData> {
	pagination?: Pagination<TPageParam>
	cursor?: Cursor<TPageParam>
}

export type GetListResult<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
>
	= | BaseGetListResult<TData>
		| GetInfiniteListResult<TData, TPageParam>

export type GetListFn = <
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
>(props: GetListProps<TPageParam>,
) => Promise<GetListResult<TData, TPageParam>>

export interface Fetcher {
	getList?: GetListFn
	getMany?: GetManyFn
	getOne?: GetOneFn
	createOne?: CreateOneFn
	createMany?: CreateManyFn
	updateOne?: UpdateOneFn
	updateMany?: UpdateManyFn
	deleteOne?: DeleteOneFn
	deleteMany?: DeleteManyFn
	custom?: CustomFn
}
