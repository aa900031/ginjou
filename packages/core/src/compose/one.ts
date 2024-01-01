import type { Simplify } from 'type-fest'
import type { QueryKey, QueryObserverOptions } from '@tanstack/query-core'
import type { BaseRecord, GetOneProps, GetOneResult } from '../query/fetcher'
import { genResourceQueryKey } from '../query/resource'
import { type Fetchers, getFetcher } from '../query/fetchers'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { type NotifyProps, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type QueryProps<
	TResultData extends BaseRecord,
	TError,
> = Simplify<
	& GetOneProps
	& NotifyProps<
		GetOneResult<TResultData>,
		GetOneProps,
		TError
	>
	& {
		fetcherName?: string
	}
>

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = QueryObserverOptions<
	GetOneResult<TData>,
	TError,
	GetOneResult<TResultData>
>

export interface CreateQueryKeyProps<
	TResultData extends BaseRecord,
	TError,
> {
	props: QueryProps<
		TResultData,
		TError
	>
}

export function createQueryKey<
	TResultData extends BaseRecord,
	TError,
>(
	props: CreateQueryKeyProps<TResultData, TError>,
): QueryKey {
	const { fetcherName, resource, id, meta } = props.props

	return [
		...genResourceQueryKey({
			resource,
			fetcherName,
		}),
		'getOne',
		id,
		{ meta },
	]
}

export interface CreateQueryFnProps<
	TResultData extends BaseRecord,
	TError,
> {
	fetchers: Fetchers
	getProps: () => QueryProps<TResultData, TError>
}

export function createQueryFn<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
	TError,
>(
	props: CreateQueryFnProps<TResultData, TError>,
): NonNullable<QueryOptions<TData, unknown, TResultData>['queryFn']> {
	return async function queryFn() {
		const _props = props.getProps()
		const _fetcher = getFetcher(_props, props.fetchers)
		const result = await _fetcher.getOne<TData>(_props)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TResultData extends BaseRecord,
	TError,
> {
	notify: NotifyFn
	getProps: () => QueryProps<TResultData, TError>
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TResultData extends BaseRecord,
>(
	props: CreateSuccessHandlerProps<TResultData, any>,
): NonNullable<QueryOptions<TData, unknown, TResultData>['onSuccess']> {
	const { getProps, notify } = props

	return function onSuccess(data) {
		const _props = getProps()

		notify(
			resolveSuccessNotifyParams(_props.successNotify, data, _props),
		)
	}
}

export interface CreateErrorHandlerProps<
	TError,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => QueryProps<any, TError>
	checkError: CheckErrorMutationFn<unknown>
}

export function createErrorHandler<
	TError,
>(
	props: CreateErrorHandlerProps<TError>,
): NonNullable<QueryOptions<any, TError, any>['onError']> {
	const { getProps, notify, translate, checkError } = props
	return function onError(error) {
		const _props = getProps()

		checkError(error)

		notify(
			resolveErrorNotifyParams(_props.errorNotify, error, _props),
			{
				key: `${_props.resource}-show-${_props.id}-notification`,
				message: translate('notifications.showError'),
				description: (error as Error | undefined)?.message,
				type: NotificationType.Error,
			},
		)
	}
}

export interface GetQueryEnabledProps {
	props: QueryProps<any, any>
	enabled?: boolean
}

export function getQueryEnabled(
	props: GetQueryEnabledProps,
): boolean {
	return props.enabled != null
		? props.enabled
		: props.props.id != null
}
