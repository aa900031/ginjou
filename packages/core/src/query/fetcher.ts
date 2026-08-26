import type { MutationFunctionContext, QueryFunctionContext } from '@tanstack/query-core'
import type { Filters } from './filter'
import type { Sorters } from './sorter'

export type Meta = Record<any, any>

export type Params = Record<any, any>

export type RecordKey = string | number

export interface BaseRecord {
	id?: RecordKey
	[key: string]: any
}

export interface Pagination<
	TPageParam = number,
> {
	current: TPageParam
	perPage: number
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
