import type { MutationObserverOptions } from '@tanstack/query-core'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { Publish } from '../realtime'
import type { BaseRecord, CustomProps, CustomResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { NotifyProps } from './notify'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from './types'
import { NotificationType } from '../notification'
import { getErrorMessage } from '../utils/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = Simplify<
	& Partial<CustomProps<TQuery, TPayload>>
	& FetcherProps
	& NotifyProps<CustomResult<TData>, CustomProps<TQuery, TPayload>, TError>
	& {
		publish?:
			| Publish.EmitEvent<TPayload>
			| (
				(
					props: ResolvedMutationProps<TData, TError, TQuery, TPayload>,
					data: CustomResult<TData>,
				) => Publish.EmitEvent<TPayload>
			)
	}
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = Simplify<
	& OverrideProperties<
		MutationProps<TData, TError, TQuery, TPayload>,
		CustomProps<TQuery, TPayload>
	>
	& ResolvedFetcherProps
>

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = MutationObserverOptions<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>
>

export type MutationOptionsFromProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = Omit<
	MutationOptions<TData, TError, TQuery, TPayload>,
	| 'mutationFn'
>

export type Props<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = Simplify<
	& MutationProps<TData, TError, TQuery, TPayload>
	& {
		mutationOptions?: MutationOptionsFromProps<TData, TError, TQuery, TPayload>
	}
>

export type MutateFn<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = OptionalMutateSyncFunction<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>
>

export type MutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = OptionalMutateAsyncFunction<
	CustomResult<TData>,
	TError,
	MutationProps<TData, TError, TQuery, TPayload>
>

export interface CreateMutationFnProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	fetchers: Fetchers
	getProps: () => Props<TData, TError, TQuery, TPayload> | undefined
}

export function createMutationFn<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	{
		fetchers,
		getProps,
	}: CreateMutationFnProps<TData, TError, TQuery, TPayload>,
): NonNullable<MutationOptions<TData, TError, TQuery, TPayload>['mutationFn']> {
	return async function mutationFn(props) {
		const resolvedProps = resolveMutationProps(getProps(), props)
		const fetcher = getFetcher(resolvedProps, fetchers)
		if (typeof fetcher.custom !== 'function')
			throw new Error('Not implemented custom on data provider')

		const result = await fetcher.custom<TData, TQuery, TPayload>(resolvedProps)

		return result
	}
}

export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	notify: NotifyFn
	publish: Publish.EmitFn<TPayload>
	getProps: () => Props<TData, TError, TQuery, TPayload> | undefined
	onSuccess: MutationOptions<TData, TError, TQuery, TPayload>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	{
		notify,
		publish,
		getProps,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TError, TQuery, TPayload>,
): NonNullable<MutationOptions<TData, TError, TQuery, TPayload>['onSuccess']> {
	return async function onSuccess(data, props, context) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
		)

		if (props.publish) {
			const event = typeof props.publish === 'function'
				? props.publish(resolvedProps, data)
				: props.publish

			publish(event)
		}

		await onSuccessFromProp?.(data, resolvedProps, context)
	}
}

export interface CreateErrorHandlerProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutationAsyncFn<unknown>
	getProps: () => Props<TData, TError, TQuery, TPayload> | undefined
	onError: MutationOptions<TData, TError, TQuery, TPayload>['onError']
}

export function createErrorHandler<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	{
		notify,
		translate,
		checkError,
		getProps,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TData, TError, TQuery, TPayload>,
): NonNullable<MutationOptions<TData, TError, TQuery, TPayload>['onError']> {
	return async function onError(error, props, context) {
		await checkError(error)

		const resolvedProps = resolveMutationProps(getProps(), props)

		notify(
			resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
			{
				key: `${resolvedProps.method}-notification`,
				message: translate('notifications.error'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)

		await onErrorFromProp?.(error, resolvedProps, context)
	}
}

export interface CreateMutateFnProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	originFn: OriginMutateSyncFunction<
		CustomResult<TData>,
		TError,
		MutationProps<TData, TError, TQuery, TPayload>
	>
}

export function createMutateFn<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	{
		originFn,
	}: CreateMutateFnProps<TData, TError, TQuery, TPayload>,
): MutateFn<TData, TError, TQuery, TPayload> {
	return function mutateFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

export interface CreateMutateAsyncFnProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	originFn: OriginMutateAsyncFunction<
		CustomResult<TData>,
		TError,
		MutationProps<TData, TError, TQuery, TPayload>
	>
}

export function createMutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	{
		originFn,
	}: CreateMutateAsyncFnProps<TData, TError, TQuery, TPayload>,
): MutateAsyncFn<TData, TError, TQuery, TPayload> {
	return function mutateAsyncFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

function resolveMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	propsFromProps: Props<TData, TError, TQuery, TPayload> | undefined,
	propsFromFn: MutationProps<TData, TError, TQuery, TPayload>,
): ResolvedMutationProps<TData, TError, TQuery, TPayload> {
	const props = resolveProps(propsFromProps, propsFromFn)
	const result: ResolvedMutationProps<TData, TError, TQuery, TPayload> = {
		...props,
		...resolveFetcherProps(props),
	}

	return result
}

function resolveProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	propsFromProps: Props<TData, TError, TQuery, TPayload> | undefined,
	propsFromFn: MutationProps<TData, TError, TQuery, TPayload>,
): OverrideProperties<MutationProps<TData, TError, TQuery, TPayload>, CustomProps<TQuery, TPayload>> {
	const props = {
		...propsFromProps,
		...propsFromFn,
	}
	const { url, method } = props
	if (url == null || method == null)
		throw new Error('No') // TODO:

	return {
		...props,
		url,
		method,
	}
}
