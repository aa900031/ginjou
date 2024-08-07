import type { SetOptional, Simplify } from 'type-fest'
import type { QueryClient, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { NotifyFn } from '../notification'
import { NotificationType } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckError } from '../auth'
import { getErrorMessage } from '../utils/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { BaseRecord, GetListProps, GetListResult, GetOneResult } from './fetcher'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import { createQueryKey as createResourceQueryKey } from './resource'
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
	& SetOptional<GetListProps<TPageParam>, 'resource'>
	& FetcherProps
>

export type ResolvedQueryProps<
	TPageParam,
> = Simplify<
	& GetListProps<TPageParam>
	& ResolvedFetcherProps
>

export function resolveQueryProps<
	TPageParam,
>(
	props: QueryProps<TPageParam>,
): ResolvedQueryProps<TPageParam> {
	return {
		...resolveFetcherProps(props),
		resource: props.resource ?? '',
		pagination: props.pagination ?? undefined,
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
	& NotifyProps<GetListResult<TResultData>, ResolvedQueryProps<TPageParam>, TError>
	& {
		queryOptions?: Omit<
			QueryOptions<TData, TError, TResultData, TPageParam>,
			| 'queryFn'
			| 'queryKey'
			| 'queryClient'
		>
	}
>

export interface CreateQueryKeyProps<
	TPageParam,
> {
	props: ResolvedQueryProps<TPageParam>
}

export function createQueryKey<
	TPageParam,
>(
	{
		props,
	}: CreateQueryKeyProps<TPageParam>,
): QueryKey {
	const { pagination, sorters, filters, meta } = props

	return [
		...createResourceQueryKey({ props }),
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
		const props = getProps()
		const _fetcher = getFetcher(props, fetchers)
		const result = await _fetcher.getList<TData, TPageParam>(props)
		updateCache(queryClient, props, result)

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
	getErrorNotify: () => NotifyProps<GetListResult<any>, ResolvedQueryProps<TPageParam>, TError>['errorNotify']
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
	return (
		enabled != null ? enabled : true
	) && (
		!!props.resource != null && props.resource !== ''
	)
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
