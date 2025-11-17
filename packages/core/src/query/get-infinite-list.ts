import type { GetNextPageParamFunction, GetPreviousPageParamFunction, InfiniteData, InfiniteQueryObserverOptions, PlaceholderDataFunction, QueryClient, QueryFunction, QueryFunctionContext, QueryKey } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { QueryEnabledFn } from '../utils/query'
import type { BaseRecord, GetInfiniteListResult, GetListFn, GetListProps, GetOneResult, Pagination } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import type { RealtimeProps } from './realtime'
import { NotificationType } from '../notification'
import { getErrorMessage } from '../utils/error'
import { getQuery, resolveQueryEnableds } from '../utils/query'
import { getFetcherFn, resolveFetcherProps } from './fetchers'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& SetOptional<
		InfiniteQueryObserverOptions<
			GetInfiniteListResult<TData, TPageParam>,
			TError,
			InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>,
			QueryKey,
			TPageParam
		>,
		| 'initialPageParam'
		| 'getNextPageParam'
	>
	& QueryCallbacks<
		InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>,
		TError
	>
>

export type GetInfiniteListProps<
	TPageParam,
> = SetRequired<
	GetListProps<TPageParam>,
	| 'pagination'
>

export type QueryProps<
	TPageParam,
> = Simplify<
	& SetOptional<
		GetInfiniteListProps<TPageParam>,
			| 'resource'
	>
	& FetcherProps
>

export type ResolvedQueryProps<
	TPageParam,
> = Simplify<
	& GetInfiniteListProps<TPageParam>
	& ResolvedFetcherProps
>

export function resolveQueryProps<
	TPageParam,
>(
	props: QueryProps<TPageParam>,
): ResolvedQueryProps<TPageParam> {
	return {
		...resolveFetcherProps(props),
		pagination: props.pagination,
		resource: props.resource ?? '',
		sorters: props.sorters ?? undefined,
		filters: props.filters ?? undefined,
		meta: props.meta,
	}
}

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& QueryProps<TPageParam>
	& NotifyProps<InfiniteData<GetInfiniteListResult<TResultData, TPageParam>>, ResolvedQueryProps<TPageParam>, TError>
	& RealtimeProps<unknown> // TODO: payload
	& {
		queryOptions?: Omit<
			QueryOptions<TData, TError, TResultData, TPageParam>,
			| 'queryFn'
			| 'queryKey'
		>
	}
>

export interface CreateQueryFnProps<
	TPageParam,
> {
	fetchers: Fetchers
	queryClient: QueryClient
	getProps: () => ResolvedQueryProps<TPageParam>
}

export function createQueryFn<
	TData extends BaseRecord,
	TPageParam,
>(
	{
		fetchers,
		queryClient,
		getProps,
	}: CreateQueryFnProps<TPageParam>,
): QueryFunction<GetInfiniteListResult<TData, TPageParam>, QueryKey, TPageParam> {
	return async function queryFn(context) {
		const props = getProps()
		const resolvedPagination = resolvePagination<TPageParam>(context, props.pagination)
		const getList = getFetcherFn(props, fetchers, 'getList') as unknown as GetListFn<TData, TPageParam>
		const result = await getList({
			...props,
			pagination: resolvedPagination,
		})
		const resolved: GetInfiniteListResult<TData, TPageParam> = {
			pagination: resolvedPagination,
			...result,
		}
		updateCache(queryClient, props, resolved)

		return resolved
	}
}

export interface CreateQueryEnabledFnProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> {
	getQueryKey: () => QueryKey
	getEnabled: () => QueryOptions<TData, TError, TResultData, TPageParam>['enabled']
	getResource: () => ResolvedQueryProps<TPageParam>['resource']
	getQueryOptions: () => Pick<QueryOptions<TData, TError, TResultData, TPageParam>, 'queryHash' | 'queryKeyHashFn'> | undefined
	queryClient: QueryClient
}

export function createQueryEnabledFn<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		getQueryKey,
		getEnabled,
		getResource,
		getQueryOptions,
		queryClient,
	}: CreateQueryEnabledFnProps<TData, TError, TResultData, TPageParam>,
): QueryEnabledFn<GetInfiniteListResult<TData, TPageParam>, TError, InfiniteData<GetInfiniteListResult<TData, TPageParam>, TPageParam>> {
	return function enabled(
		query = getQuery<GetInfiniteListResult<TData, TPageParam>, TError, InfiniteData<GetInfiniteListResult<TData, TPageParam>, TPageParam>>({
			...getQueryOptions(),
			queryKey: getQueryKey(),
			queryClient,
		},
		),
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => {
					const resource = getResource()
					return resource != null && resource !== ''
				},
			],
		)
	}
}

export interface GetInitialPageParamProps<
	TPageParam,
> {
	props: ResolvedQueryProps<TPageParam>
}

export function getInitialPageParam<
	TPageParam,
>(
	{
		props,
	}: GetInitialPageParamProps<TPageParam>,
): TPageParam {
	return props.pagination.current
}

export function createGetNextPageParamFn<
	TData extends BaseRecord,
	TPageParam,
>(): GetNextPageParamFunction<TPageParam, GetInfiniteListResult<TData, TPageParam>> {
	return function getNextPageParam(
		lastPage,
	) {
		const { cursor, pagination } = lastPage

		if (cursor)
			return cursor.next

		if (pagination == null)
			return undefined

		const { current, perPage } = pagination
		if (typeof current === 'number') {
			const totalPages = Math.ceil((lastPage.total || 0) / perPage)

			return current < totalPages ? (Number(current) + 1) as TPageParam : undefined
		}
	}
}

export function createGetPreviousPageParamFn<
	TData extends BaseRecord,
	TPageParam,
>(): GetPreviousPageParamFunction<TPageParam, GetInfiniteListResult<TData, TPageParam>> {
	return function getPreviousPageParam(
		lastPage,
	) {
		const { cursor, pagination } = lastPage

		if (cursor)
			return cursor.prev

		if (pagination == null)
			return undefined

		const { current } = pagination
		if (typeof current === 'number')
			return current === 1 ? undefined : (current - 1) as TPageParam
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	notify: NotifyFn
	getProps: () => ResolvedQueryProps<TPageParam>
	getSuccessNotify: () => NotifyProps<InfiniteData<GetInfiniteListResult<TResultData, TPageParam>>, ResolvedQueryProps<TPageParam>, unknown>['successNotify']
	emitParent: NonNullable<QueryOptions<any, unknown, TResultData, TPageParam>['onSuccess']>
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		notify,
		getProps,
		getSuccessNotify,
		emitParent,
	}: CreateSuccessHandlerProps<TResultData, TPageParam>,
): NonNullable<QueryOptions<TData, unknown, TResultData, TPageParam>['onSuccess']> {
	return function onSuccess(data) {
		emitParent(data)

		const props = getProps()
		const successNotify = getSuccessNotify()

		notify(
			resolveSuccessNotifyParams(successNotify, data, props),
		)
	}
}

export interface CreateErrorHandlerProps<
	TError,
	TPageParam,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => ResolvedQueryProps<TPageParam>
	getErrorNotify: () => NotifyProps<any, ResolvedQueryProps<TPageParam>, TError>['errorNotify']
	checkError: CheckError.MutateAsyncFn<TError, unknown>
	emitParent: NonNullable<QueryOptions<any, TError, any, TPageParam>['onError']>
}

export function createErrorHandler<
	TError,
	TPageParam,
>(
	{
		getProps,
		getErrorNotify,
		notify,
		translate,
		checkError,
		emitParent,
	}: CreateErrorHandlerProps<TError, TPageParam>,
): NonNullable<QueryOptions<any, TError, any, TPageParam>['onError']> {
	return function onError(error) {
		checkError(error)

		emitParent(error)

		const props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, props),
			{
				key: `${props.resource}-get-list-notification`,
				message: translate('notifications.getListErrors'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

export interface GetRecordsProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	data: InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam> | undefined
}

export function getRecords<
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		data,
	}: GetRecordsProps<TResultData, TPageParam>,
): TResultData[][] | undefined {
	return data?.pages.map(page => page.data)
}

export function createPlacholerDataFn<
	TData extends BaseRecord,
	TError,
	TPageParam,
>(): PlaceholderDataFunction<InfiniteData<GetInfiniteListResult<TData, TPageParam>, TPageParam>, TError, InfiniteData<GetInfiniteListResult<TData, TPageParam>, TPageParam>> {
	return function placeholderDataFn(previousData) {
		return previousData
	}
}

function resolvePagination<
	TPageParam,
>(
	context: QueryFunctionContext<QueryKey, TPageParam>,
	pagination: ResolvedQueryProps<TPageParam>['pagination'],
): Pagination<TPageParam> | undefined {
	const current = (context.pageParam as TPageParam | undefined) ?? pagination.current
	const perPage = pagination.perPage

	return {
		current,
		perPage,
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
>(
	queryClient: QueryClient,
	props: ResolvedQueryProps<TPageParam>,
	result: GetInfiniteListResult<TData, TPageParam>,
): void {
	for (const record of result.data) {
		if (record.id == null)
			continue

		queryClient.setQueryData<GetOneResult<TData>>(
			createGetOneQueryKey({
				props: { ...props, id: record.id },
			}),
			old => old ?? { data: record },
		)
	}
}
