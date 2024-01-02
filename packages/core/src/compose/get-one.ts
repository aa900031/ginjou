import type { SetOptional, SetRequired, Simplify } from 'type-fest'
import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { BaseRecord, GetOneProps, GetOneResult } from '../query/fetcher'
import type { Fetchers } from '../query/fetchers'
import { getFetcher } from '../query/fetchers'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { getErrorMessage } from '../controller/error'
import type { NotifyProps } from './notify'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import type { FetcherProps } from './fetchers'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = QueryObserverOptions<
	GetOneResult<TData>,
	TError,
	GetOneResult<TResultData>
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
	& SetRequired<
			FetcherProps,
			| 'fetcherName'
		>
>

export function resolveQueryProps(
	props: QueryProps,
): ResolvedQueryProps {
	return {
		id: props.id ?? '',
		resource: props.resource ?? '',
		meta: props.meta,
		fetcherName: props.fetcherName ?? 'default',
	}
}

export interface CreateQueryKeyProps {
	props: ResolvedQueryProps
}

export function createQueryKey(
	props: CreateQueryKeyProps,
): QueryKey {
	const { fetcherName, resource, id, meta } = props.props

	return [
		fetcherName,
		resource,
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
	TResultData extends BaseRecord,
	TError,
>(
	props: CreateQueryFnProps,
): NonNullable<QueryOptions<TData, TError, TResultData>['queryFn']> {
	return async function queryFn() {
		const _props = props.getProps()
		const _fetcher = getFetcher(_props, props.fetchers)
		const result = await _fetcher.getOne<TData>(_props)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
> {
	notify: NotifyFn
	getProps: () => ResolvedQueryProps
	getSuccessNotify: () => NotifyProps<GetOneResult<TResultData>, ResolvedQueryProps, unknown>['successNotify']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
>(
	{
		notify,
		getProps,
		getSuccessNotify,
	}: CreateSuccessHandlerProps<TResultData>,
): NonNullable<QueryOptions<TData, unknown, TResultData>['onSuccess']> {
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
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => ResolvedQueryProps
	getErrorNotify: () => NotifyProps<GetOneResult<any>, ResolvedQueryProps, TError>['errorNotify']
	checkError: CheckErrorMutationFn<unknown>
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
	}: CreateErrorHandlerProps<TError>,
): NonNullable<QueryOptions<any, TError, any>['onError']> {
	return function onError(error) {
		checkError(error)

		const _props = getProps()
		const errorNotify = getErrorNotify()

		notify(
			resolveErrorNotifyParams(errorNotify, error, _props),
			{
				key: `${_props.resource}-get-one-${_props.id}-notification`,
				message: translate('notifications.getOneError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

export interface GetQueryEnabledProps {
	props: ResolvedQueryProps
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
		: props.id != null && props.id !== ''
}
