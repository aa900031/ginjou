import type { PlaceholderDataFunction, QueryClient, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { SetOptional, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { ResolvedRealtimeOptions, SubscribeListParams } from '../realtime'
import type { EnabledGetter } from '../utils/query'
import type { BaseRecord, GetListProps, GetListResult, GetOneResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import type { RealtimeProps } from './realtime'
import type { ResourceQueryProps } from './resource'
import { NotificationType } from '../notification'
import { SubscribeType } from '../realtime'
import { getErrorMessage } from '../utils/error'
import { resolveEnabled } from '../utils/query'
import { getFetcher, resolveFetcherProps } from './fetchers'
import { createQueryKey as createGetOneQueryKey } from './get-one'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createQueryKey as createResourceQueryKey } from './resource'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& Omit<
		QueryObserverOptions<
			GetListResult<TData, TPageParam>,
			TError,
			GetListResult<TResultData, TPageParam>,
			GetListResult<TResultData, TPageParam>,
			QueryKey,
			TPageParam
		>,
		| 'enabled'
	>
	& QueryCallbacks<
		GetListResult<TResultData, TPageParam>,
		TError
	>
	& {
		enabled?: EnabledGetter
	}
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
	& RealtimeProps<unknown> // TODO: payload
	& {
		queryOptions?: Omit<
			QueryOptions<TData, TError, TResultData, TPageParam>,
			| 'queryFn'
			| 'queryKey'
		>
	}
>

export interface CreateBaseQueryKeyProps {
	props: ResourceQueryProps
}

export function createBaseQueryKey(
	{
		props,
	}: CreateBaseQueryKeyProps,
): QueryKey {
	return [
		...createResourceQueryKey({ props }),
		'getList',
	]
}

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
		...createBaseQueryKey({ props }),
		[pagination, sorters, filters, meta].every(item => item == null)
			? undefined
			: {
					pagination,
					sorters,
					filters,
					meta,
				},
	].filter(Boolean)
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
	checkError: CheckError.MutationAsyncFn<unknown>
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
	enabled: QueryOptions<any, any, any, any>['enabled']
}

export function getQueryEnabled(
	{
		enabled,
		props,
	}: GetQueryEnabledProps,
): boolean {
	return resolveEnabled(
		enabled,
		!!props.resource != null && props.resource !== '',
	)
}

export interface GetSubscribeParamsProps {
	queryProps: ResolvedQueryProps<unknown>
	realtimeOptions: ResolvedRealtimeOptions<unknown>
}

export function getSubscribeParams(
	{
		queryProps,
		realtimeOptions,
	}: GetSubscribeParamsProps,
): SubscribeListParams {
	return {
		type: SubscribeType.List,
		resource: queryProps.resource,
		pagination: queryProps.pagination,
		sorters: queryProps.sorters,
		filters: queryProps.filters,
		meta: queryProps.meta,
		...realtimeOptions.params,
	}
}

export function createPlacholerDataFn<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
>(): PlaceholderDataFunction<GetListResult<TData>, TError, GetListResult<TResultData>> {
	return function placeholderDataFn(previousData) {
		return previousData
	}
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
