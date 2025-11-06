import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { Publish } from '../realtime'
import type { BaseRecord, CreateManyProps, CreateManyResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { InvalidatesProps, InvalidateTargetType, ResolvedInvalidatesProps } from './invalidate'
import type { NotifyProps } from './notify'
import type { PublishPayload } from './publish'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction } from './types'
import { NotificationType } from '../notification'
import { RealtimeAction } from '../realtime/event'
import { getErrorMessage } from '../utils/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import { fakeMany } from './helper'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from './invalidate'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createPublishMeta, createPublishPayloadByMany } from './publish'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& Partial<CreateManyProps<TParams>>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<CreateManyResult<TData>, CreateManyProps<TParams>, TError>
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& OverrideProperties<
		MutationProps<TData, TError, TParams>,
		CreateManyProps<TParams>
	>
	& ResolvedFetcherProps
	& ResolvedInvalidatesProps
>

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TParams,
> = MutationObserverOptions<
	CreateManyResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>
>

export type MutationOptionsFromProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Omit<
	MutationOptions<TData, TError, TParams>,
	| 'mutationFn'
>

export type Props<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& MutationProps<TData, TError, TParams>
	& {
		mutationOptions?: MutationOptionsFromProps<TData, TError, TParams>
	}
>

export type MutateFn<
	TData extends BaseRecord,
	TError,
	TParams,
> = OptionalMutateSyncFunction<
	CreateManyResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>
>

export type MutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TParams,
> = OptionalMutateAsyncFunction<
	CreateManyResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>
>

export interface CreateMutationFnProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	fetchers: Fetchers
	getProps: () => Props<TData, TError, TParams> | undefined
}

export function createMutationFn<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		fetchers,
		getProps,
	}: CreateMutationFnProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['mutationFn']> {
	return async function mutationFn(props) {
		const resolveProps = resolveMutationProps(getProps(), props)

		const fetcher = getFetcher(resolveProps, fetchers)
		if (typeof fetcher.createMany === 'function')
			return await fetcher.createMany<TData, TParams>(resolveProps)
		if (typeof fetcher.createOne === 'function')
			return await fakeMany(resolveProps.params.map(val => fetcher.createOne!<TData, TParams>({ ...resolveProps, params: val })))

		throw new Error('No')
	}
}

export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	publish: Publish.EmitFn<PublishPayload>
	queryClient: QueryClient
	getProps: () => Props<TData, TError, TParams> | undefined
	onSuccess: MutationOptions<TData, TError, TParams>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		notify,
		translate,
		publish,
		queryClient,
		getProps,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onSuccess']> {
	return async function onSuccess(data, props, onMutateResult, context) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
			{
				key: `create-${resolvedProps.resource}-notification`,
				message: translate('notifications.createSuccess'),
				description: translate('notifications.success'),
				type: NotificationType.Success,
			},
		)

		await triggerInvalidates(resolvedProps, queryClient)

		publish(
			createPublishEvent(resolvedProps, data),
		)

		// TODO: logs

		await onSuccessFromProp?.(data, resolvedProps, onMutateResult, context)
	}
}

export interface CreateErrorHandlerProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutateAsyncFn<TError, unknown>
	getProps: () => Props<TData, TError, TParams> | undefined
	onError: MutationOptions<TData, TError, TParams>['onError']
}

export function createErrorHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		notify,
		translate,
		checkError,
		getProps,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onError']> {
	return async function onError(error, props, onMutateResult, context) {
		await checkError(error)

		const resolvedProps = resolveMutationProps(getProps(), props)

		notify(
			resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
			{
				key: `create-${resolvedProps.resource}-notification`,
				message: translate('notifications.createError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)

		await onErrorFromProp?.(error, resolvedProps, onMutateResult, context)
	}
}

export interface CreateMutateFnProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	originFn: OriginMutateSyncFunction<
		CreateManyResult<TData>,
		TError,
		MutationProps<TData, TError, TParams>
	>
}

export function createMutateFn<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		originFn,
	}: CreateMutateFnProps<TData, TError, TParams>,
): MutateFn<TData, TError, TParams> {
	return function mutateFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

export interface CreateMutateAsyncFnProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	originFn: OriginMutateAsyncFunction<
		CreateManyResult<TData>,
		TError,
		MutationProps<TData, TError, TParams>
	>
}

export function createMutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		originFn,
	}: CreateMutateAsyncFnProps<TData, TError, TParams>,
): MutateAsyncFn<TData, TError, TParams> {
	return function mutateAsyncFn(variables, options) {
		return originFn(variables || ({} as any), options)
	}
}

function createPublishEvent(
	resolvedProps: ResolvedMutationProps<any, any, any>,
	data: CreateManyResult,
): Publish.EmitEvent<PublishPayload> {
	const payload = createPublishPayloadByMany(resolvedProps, data)
	const meta = createPublishMeta(resolvedProps)

	return {
		channel: `resources/${resolvedProps.resource}`,
		action: RealtimeAction.Created,
		payload,
		meta,
	}
}

const DEFAULT_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

function resolveMutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	propsFromProps: Props<TData, TError, TParams> | undefined,
	propsFromFn: MutationProps<TData, TError, TParams>,
): ResolvedMutationProps<TData, TError, TParams> {
	const props = resolveProps(propsFromProps, propsFromFn)
	const result: ResolvedMutationProps<TData, TError, TParams> = {
		...props,
		...resolveFetcherProps(props),
		...resolveInvalidateProps(props, DEFAULT_INVALIDATES),
	}

	return result
}

function resolveProps<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	propsFromProps: Props<TData, TError, TParams> | undefined,
	propsFromFn: MutationProps<TData, TError, TParams>,
): OverrideProperties<MutationProps<TData, TError, TParams>, CreateManyProps<TParams>> {
	const props = {
		...propsFromProps,
		...propsFromFn,
	}
	const { resource, params } = props
	if (resource == null || params == null)
		throw new Error('No') // TODO:

	return {
		...props,
		resource,
		params,
	}
}
