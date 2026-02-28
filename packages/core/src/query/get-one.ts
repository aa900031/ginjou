import type { PlaceholderDataFunction, QueryClient, QueryFunction, QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { SetOptional, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { ResolvedRealtimeOptions, SubscribeOneParams } from '../realtime'
import type { QueryEnabledFn } from '../utils/query'
import type { BaseRecord, GetOneFn, GetOneProps, GetOneResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import type { RealtimeProps } from './realtime'
import { NotificationType } from '../notification'
import { SubscribeType } from '../realtime'
import { getErrorMessage } from '../utils/error'
import { getQuery, resolveQueryEnableds } from '../utils/query'
import { getFetcherFn, resolveFetcherProps } from './fetchers'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createQueryKey as createResourceQueryKey } from './resource'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& QueryObserverOptions<
		GetOneResult<TData>,
		TError,
		GetOneResult<TResultData>,
		GetOneResult<TData>
	>
	& QueryCallbacks<
		GetOneResult<TResultData>,
		TError
	>
>

export type QueryProps = Simplify<
	& SetOptional<
		GetOneProps,
		| 'id'
		| 'resource'
	>
	& FetcherProps
>

export type ResolvedQueryProps = Simplify<
	& GetOneProps
	& ResolvedFetcherProps
>

export function resolveQueryProps(
	props: QueryProps,
): ResolvedQueryProps {
	return {
		...resolveFetcherProps(props),
		id: props.id ?? '',
		resource: props.resource ?? '',
		meta: props.meta,
	}
}

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& QueryProps
	& NotifyProps<GetOneResult<TResultData>, ResolvedQueryProps, TError>
	& RealtimeProps<unknown> // TODO:
	& {
		queryOptions?: Omit<
			QueryOptions<TData, TError, TResultData>,
			| 'queryFn'
			| 'queryKey'
		>
	}
>

export interface CreateQueryKeyProps {
	props: ResolvedQueryProps
}

export function createQueryKey(
	{
		props,
	}: CreateQueryKeyProps,
): QueryKey {
	const { id, meta } = props

	return [
		...createResourceQueryKey({ props }),
		'getOne',
		id,
		{ meta },
	]
}

export interface CreateQueryFnProps {
	fetchers: Fetchers
	getProps: () => ResolvedQueryProps
}

export function createQueryFn<
	TData extends BaseRecord,
>(
	{
		fetchers,
		getProps,
	}: CreateQueryFnProps,
): QueryFunction<GetOneResult<TData>> {
	return async function queryFn(context) {
		const props = getProps()
		const getOne = getFetcherFn(props, fetchers, 'getOne') as GetOneFn<TData>
		const result = await getOne(props, context)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
> {
	notify: NotifyFn
	getProps: () => ResolvedQueryProps
	getSuccessNotify: () => NotifyProps<GetOneResult<TResultData>, ResolvedQueryProps, unknown>['successNotify']
	emitParent: NonNullable<QueryOptions<any, unknown, TResultData>['onSuccess']>
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
>(
	{
		notify,
		getProps,
		getSuccessNotify,
		emitParent,
	}: CreateSuccessHandlerProps<TResultData>,
): NonNullable<QueryOptions<TData, unknown, TResultData>['onSuccess']> {
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
> {
	notify: NotifyFn
	translate: TranslateFn<any>
	getProps: () => ResolvedQueryProps
	getErrorNotify: () => NotifyProps<GetOneResult<any>, ResolvedQueryProps, TError>['errorNotify']
	checkError: CheckError.MutateAsyncFn<TError, unknown>
	emitParent: NonNullable<QueryOptions<any, TError, any>['onError']>
}

export function createErrorHandler<
	TError,
>(
	{
		getProps,
		getErrorNotify,
		notify,
		translate,
		checkError,
		emitParent,
	}: CreateErrorHandlerProps<TError>,
): NonNullable<QueryOptions<any, TError, any>['onError']> {
	return function onError(error) {
		checkError(error)

		emitParent(error)

		const props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, props),
			{
				key: `${props.resource}-get-one-${props.id}-notification`,
				message: translate('notifications.getOneError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

export interface CreateQueryEnabledFnProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> {
	getQueryKey: () => QueryKey
	getEnabled: () => QueryOptions<TData, TError, TResultData>['enabled']
	getId: () => ResolvedQueryProps['id']
	getQueryOptions: () => Pick<QueryOptions<TData, TError, TResultData>, 'queryHash' | 'queryKeyHashFn'> | undefined
	queryClient: QueryClient
}

export function createQueryEnabledFn<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
>(
	{
		getQueryKey,
		getEnabled,
		getId,
		getQueryOptions,
		queryClient,
	}: CreateQueryEnabledFnProps<TData, TError, TResultData>,
): QueryEnabledFn<GetOneResult<TData>, TError, GetOneResult<TData>> {
	return function enabled(
		query = getQuery<GetOneResult<TData>, TError, GetOneResult<TData>>({
			...getQueryOptions(),
			queryKey: getQueryKey(),
			queryClient,
		}),
	) {
		return resolveQueryEnableds(
			query,
			[
				getEnabled(),
				() => {
					const id = getId()
					return id != null && id !== ''
				},
			],
		)
	}
}

export interface GetSubscribeParamsProps {
	queryProps: ResolvedQueryProps
	realtimeOptions: ResolvedRealtimeOptions<unknown>
}

export function getSubscribeParams(
	{
		queryProps,
		realtimeOptions,
	}: GetSubscribeParamsProps,
): SubscribeOneParams {
	return {
		type: SubscribeType.One,
		resource: queryProps.resource,
		id: queryProps.id,
		meta: queryProps.meta,
		...realtimeOptions.params,
	}
}

export function createPlacholerDataFn<
	TData extends BaseRecord,
	TError,
>(): PlaceholderDataFunction<GetOneResult<TData>, TError, GetOneResult<TData>> {
	return function placeholderDataFn(previousData) {
		return previousData
	}
}
