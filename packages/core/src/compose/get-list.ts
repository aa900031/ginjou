import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { QueryClient, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { BaseRecord, GetListProps, GetListResult, GetOneResult, Pagination, PaginationPayload } from '../query/fetcher'
import type { Fetchers } from '../query/fetchers'
import { getFetcher } from '../query/fetchers'
import type { NotifyFn } from '../notification'
import { NotificationType } from '../notification'
import { getErrorMessage } from '../controller/error'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import type { FetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = QueryObserverOptions<
	GetListResult<TData, TPageParam>,
	TError,
	GetListResult<TResultData, TPageParam>
>

export type QueryProps<
	TPageParam,
> = Simplify<
	& Omit<
			SetOptional<GetListProps<TPageParam>, 'resource'>,
			| 'pagination'
		>
	& FetcherProps
	& {
		pagination?: PaginationPayload<TPageParam>
	}
>

export type ResolvedQueryProps<
	TPageParam,
> = Simplify<
	& GetListProps<TPageParam>
	& SetRequired<
			FetcherProps,
			| 'fetcherName'
		>
>

const DEFAULT_PAGINATION: Pagination<number> = {
	current: 1,
	perPage: 10,
}

export function resolveQueryProps<
	TPageParam,
>(
	props: QueryProps<TPageParam>,
): ResolvedQueryProps<TPageParam> {
	return {
		resource: props.resource ?? '',
		pagination: {
			current: props.pagination?.current ?? DEFAULT_PAGINATION.current,
			perPage: props.pagination?.perPage ?? DEFAULT_PAGINATION.perPage,
		} as Pagination<TPageParam>,
		sorters: props.sorters ?? undefined,
		filters: props.filters ?? undefined,
		meta: props.meta,
		fetcherName: props.fetcherName ?? 'default',
	}
}

export interface CreateQueryKeyProps<
	TPageParam,
> {
	props: QueryProps<TPageParam>
}

export function createQueryKey<
	TPageParam,
>(
	{
		props: {
			fetcherName,
			resource,
			pagination,
			sorters,
			filters,
			meta,
		},
	}: CreateQueryKeyProps<TPageParam>,
): QueryKey {
	return [
		fetcherName,
		resource,
		'getList',
		{
			pagination,
			sorters,
			filters,
			meta,
		},
	]
}

export interface CreateQueryFnProps<
	TPageParam,
> {
	fetchers: Fetchers
	queryClient: QueryClient
	getProps: () => ResolvedQueryProps<TPageParam>
}

export function createQueryFn<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TError,
	TPageParam,
>(
	{
		fetchers,
		queryClient,
		getProps,
	}: CreateQueryFnProps<TPageParam>,
): NonNullable<QueryOptions<TData, TError, TResultData, TPageParam>['queryFn']> {
	return async function queryFn() {
		const _props = getProps()
		const _fetcher = getFetcher(_props, fetchers)
		const result = await _fetcher.getList<TData, TPageParam>(_props)
		updateCache(queryClient, _props, result)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
	TPageParam,
> {
	notify: NotifyFn
	getProps: () => ResolvedQueryProps<TPageParam>
	getSuccessNotify: () => NotifyProps<GetListResult<TResultData>, ResolvedQueryProps<TPageParam>, unknown>['successNotify']
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
	}: CreateSuccessHandlerProps<TResultData, TPageParam>,
): NonNullable<QueryOptions<TData, unknown, TResultData, TPageParam>['onSuccess']> {
	return function onSuccess(data) {
		const _props = getProps()
		const successNotify = getSuccessNotify()

		notify(
			resolveSuccessNotifyParams(successNotify, data, _props),
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
	getErrorNotify: () => NotifyProps<GetListResult<any>, ResolvedQueryProps<TPageParam>, TError>['errorNotify']
	checkError: CheckErrorMutationFn<unknown>
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
	}: CreateErrorHandlerProps<TError, TPageParam>,
): NonNullable<QueryOptions<any, TError, any, TPageParam>['onError']> {
	return function onError(error) {
		checkError(error)

		const _props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, _props),
			{
				key: `${_props.resource}-get-list-notification`,
				message: translate('notifications.getListErrors'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

export interface GetQueryEnabledProps {
	props: ResolvedQueryProps<any>
	enabled?: boolean
}

export function getQueryEnabled(
	{
		enabled,
		props,
	}: GetQueryEnabledProps,
): boolean {
	return enabled != null
		? enabled
		: !!props.resource != null && props.resource !== ''
}

function updateCache<
	TData extends BaseRecord,
	TPageParam,
>(
	queryClient: QueryClient,
	props: ResolvedQueryProps<TPageParam>,
	result: GetListResult<TData, TPageParam>,
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
