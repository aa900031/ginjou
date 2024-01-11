import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { SetRequired, Simplify } from 'type-fest'
import type { BaseRecord, CustomProps, CustomResult } from '../query/fetcher'
import { type Fetchers, getFetcher } from '../query/fetchers'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { getErrorMessage } from '../controller/error'
import type { FetcherProps } from './fetchers'
import { type NotifyProps, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = QueryObserverOptions<
	CustomResult<TData>,
	TError,
	CustomResult<TResultData>
>

export type QueryProps<
	TQuery,
	TPayload,
> = Simplify<
	& CustomProps<TQuery, TPayload>
	& FetcherProps
>

export type ResolvedQueryProps<
	TQuery,
	TPayload,
> = Simplify<
	& CustomProps<TQuery, TPayload>
	& SetRequired<
			FetcherProps,
			| 'fetcherName'
		>
>

export function resolveQueryProps<
	TQuery,
	TPayload,
>(
	props: QueryProps<TQuery, TPayload>,
): ResolvedQueryProps<TQuery, TPayload> {
	return {
		url: props.url,
		method: props.method,
		sorters: props.sorters,
		filters: props.filters,
		payload: props.payload,
		query: props.query,
		headers: props.headers,
		meta: props.meta,
		fetcherName: props.fetcherName ?? 'default',
	}
}

export interface CreateQueryKeyProps<
	TQuery,
	TPayload,
> {
	props: ResolvedQueryProps<TQuery, TPayload>
}

export function createQueryKey<
	TQuery,
	TPayload,
>(
	{
		props,
	}: CreateQueryKeyProps<TQuery, TPayload>,
): QueryKey {
	const { fetcherName, method, url, ...rest } = props

	return [
		fetcherName,
		'custom',
		method,
		url,
		rest,
	]
}

export interface CreateQueryFnProps<
	TQuery,
	TPayload,
> {
	fetchers: Fetchers
	getProps: () => ResolvedQueryProps<TQuery, TPayload>
}

export function createQueryFn<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	{
		getProps,
		fetchers,
	}: CreateQueryFnProps<TQuery, TPayload>,
): NonNullable<QueryOptions<TData, TError, TResultData>['queryFn']> {
	return async function queryFn() {
		const props = getProps()
		const _fetcher = getFetcher(props, fetchers)
		if (typeof _fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')

		const result = await _fetcher.custom<TData, TQuery, TPayload>(props)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
	TQuery,
	TPayload,
> {
	notify: NotifyFn
	getProps: () => ResolvedQueryProps<TQuery, TPayload>
	getSuccessNotify: () => NotifyProps<CustomResult<TResultData>, ResolvedQueryProps<TQuery, TPayload>, unknown>['successNotify']
	emitParent: NonNullable<QueryOptions<any, unknown, TResultData>['onSuccess']>
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TQuery,
	TPayload,
>(
	{
		notify,
		getProps,
		getSuccessNotify,
		emitParent,
	}: CreateSuccessHandlerProps<TResultData, TQuery, TPayload>,
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
	TQuery,
	TPayload,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => ResolvedQueryProps<TQuery, TPayload>
	getErrorNotify: () => NotifyProps<CustomResult<any>, ResolvedQueryProps<TQuery, TPayload>, TError>['errorNotify']
	checkError: CheckErrorMutationFn<unknown>
	emitParent: NonNullable<QueryOptions<any, TError, any>['onError']>
}

export function createErrorHandler<
	TError,
	TQuery,
	TPayload,
>(
	{
		getProps,
		getErrorNotify,
		notify,
		translate,
		checkError,
		emitParent,
	}: CreateErrorHandlerProps<TError, TQuery, TPayload>,
): NonNullable<QueryOptions<any, TError, any>['onError']> {
	return function onError(error) {
		checkError(error)

		emitParent(error)

		const props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, props),
			{
				key: `${props.method}-notification`,
				message: translate('notifications.error'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}
