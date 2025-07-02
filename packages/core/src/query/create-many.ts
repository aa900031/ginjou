import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { Publish } from '../realtime'
import type { BaseRecord, CreateManyProps, CreateManyResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { InvalidatesProps, InvalidateTargetType, ResolvedInvalidatesProps } from './invalidate'
import type { NotifyProps } from './notify'
import type { PublishPayload } from './publish'
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
	& CreateManyProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<CreateManyResult<TData>, CreateManyProps<TParams>, TError>
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& MutationProps<TData, TError, TParams>
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

export interface CreateMutationFnProps {
	fetchers: Fetchers
}

export function createMutationFn<
	TData extends BaseRecord,
	TParams,
>(
	{
		fetchers,
	}: CreateMutationFnProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['mutationFn']> {
	return async function mutationFn(props) {
		const resolveProps = resolveMutationProps(props)
		const fetcher = getFetcher(resolveProps, fetchers)
		const result = typeof fetcher.createMany === 'function'
			? await fetcher.createMany<TData, TParams>(resolveProps)
			: await fakeMany(resolveProps.params.map(val => fetcher.create<TData, TParams>({ ...resolveProps, params: val })))

		return result
	}
}
export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TParams,
> {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	publish: Publish.EmitFn<PublishPayload>
	queryClient: QueryClient
	onSuccess: MutationOptions<TData, unknown, TParams>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		notify,
		translate,
		publish,
		queryClient,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TParams>,
): NonNullable<MutationOptions<TData, unknown, TParams>['onSuccess']> {
	return async function onSuccess(data, props, context) {
		const resolvedProps = resolveMutationProps(props)

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

		await onSuccessFromProp?.(data, resolvedProps, context)
	}
}

export interface CreateErrorHandlerProps<
	TError,
	TParams,
> {
	notify: NotifyFn
	translate: TranslateFn<TParams>
	checkError: CheckError.MutationFn<TError>
	onError: MutationOptions<any, TError, TParams>['onError']
}

export function createErrorHandler<
	TError,
	TParams,
>(
	{
		notify,
		translate,
		checkError,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TError, TParams>,
): NonNullable<MutationOptions<any, TError, any>['onError']> {
	return async function onError(error, props, context) {
		await checkError(error)

		const resolvedProps = resolveMutationProps(props)

		notify(
			resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
			{
				key: `create-${resolvedProps.resource}-notification`,
				message: translate('notifications.createError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)

		await onErrorFromProp?.(error, resolvedProps, context)
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

const cacheResolvedProps = new WeakMap<MutationProps<any, any, any>, ResolvedMutationProps<any, any, any>>()

function resolveMutationProps(
	props: MutationProps<any, any, any>,
): ResolvedMutationProps<any, any, any> {
	const cached = cacheResolvedProps.get(props)
	if (cached)
		return cached

	const result: ResolvedMutationProps<any, any, any> = {
		...props,
		...resolveFetcherProps(props),
		...resolveInvalidateProps(props, DEFAULT_INVALIDATES),
	}
	cacheResolvedProps.set(props, result)

	return result
}
