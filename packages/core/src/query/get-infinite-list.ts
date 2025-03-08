import type { InfiniteData, InfiniteQueryObserverOptions, QueryClient, QueryFunctionContext, QueryKey } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { EnabledGetter } from '../utils/query'
import type { BaseRecord, GetInfiniteListResult, GetOneResult, Pagination } from './fetcher'
import type { Fetchers } from './fetchers'
import type { QueryProps, ResolvedQueryProps } from './get-list'
import type { NotifyProps } from './notify'
import type { RealtimeProps } from './realtime'
import { NotificationType } from '../notification'
import { getErrorMessage } from '../utils/error'
import { getFetcher } from './fetchers'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& Omit<
		InfiniteQueryObserverOptions<
			GetInfiniteListResult<TData, TPageParam>,
			TError,
			InfiniteData<GetInfiniteListResult<TResultData, TPageParam>>,
			GetInfiniteListResult<TData, TPageParam>,
			QueryKey,
			TPageParam
		>,
		| 'enabled'
	>
	& QueryCallbacks<
		InfiniteData<GetInfiniteListResult<TResultData, TPageParam>>,
		TError
	>
	& {
		enabled?: EnabledGetter
	}
>

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
			| 'queryClient'
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
	TError,
	TResultData extends BaseRecord,
	TPageParam,
>(
	{
		fetchers,
		queryClient,
		getProps,
	}: CreateQueryFnProps<TPageParam>,
): NonNullable<QueryOptions<TData, TError, TResultData, TPageParam>['queryFn']> {
	return async function queryFn(context) {
		const props = getProps()
		const fetcher = getFetcher(props, fetchers)
		const resolvedPagination = resolvePagination<TPageParam>(context, props.pagination)
		const result = await fetcher.getList<TData, TPageParam>({
			...props,
			pagination: resolvedPagination,
		})
		const resolved: GetInfiniteListResult<TData, TPageParam> = {
			...result,
			pagination: (
				'cursor' in result || 'pagination' in result
					? result.pagination
					: undefined
			) ?? resolvedPagination,
		}
		updateCache(queryClient, props, resolved)

		return resolved
	}
}

export function getNextPageParam<
	TPageParam,
	TData extends BaseRecord,
>(
	lastPage: GetInfiniteListResult<TData, TPageParam>,
): TPageParam | undefined {
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

export function getPreviousPageParam<
	TPageParam,
	TData extends BaseRecord,
>(
	lastPage: GetInfiniteListResult<TData, TPageParam>,
): TPageParam | undefined {
	const { cursor, pagination } = lastPage

	if (cursor)
		return cursor.prev

	if (pagination == null)
		return undefined

	const { current } = pagination
	if (typeof current === 'number')
		return current === 1 ? undefined : (current - 1) as TPageParam
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
	checkError: CheckError.MutationFn<unknown>
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
function resolvePagination<
	TPageParam,
>(
	context: QueryFunctionContext<QueryKey, TPageParam>,
	pagination: ResolvedQueryProps<TPageParam>['pagination'],
): Pagination<TPageParam> | undefined {
	const current = context.pageParam ?? pagination?.current
	const perPage = pagination?.perPage
	if (current == null || perPage == null)
		return

	return {
		current: current as TPageParam,
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
