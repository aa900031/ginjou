import type { SetOptional, Simplify } from 'type-fest'
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
import { type FetcherProps, type ResolvedFetcherProps, resolveFetcherProps } from './fetchers'

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
	{
		fetchers,
		getProps,
	}: CreateQueryFnProps,
): NonNullable<QueryOptions<TData, TError, TResultData>['queryFn']> {
	return async function queryFn() {
		const props = getProps()
		const _fetcher = getFetcher(props, fetchers)
		const result = await _fetcher.getOne<TData>(props)

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
	translate: TranslateFn<unknown>
	getProps: () => ResolvedQueryProps
	getErrorNotify: () => NotifyProps<GetOneResult<any>, ResolvedQueryProps, TError>['errorNotify']
	checkError: CheckErrorMutationFn<unknown>
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
