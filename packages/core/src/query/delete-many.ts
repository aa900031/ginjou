import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { Publish } from '../realtime'
import type { BaseRecord, DeleteManyProps, DeleteManyResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { InvalidatesProps, InvalidateTargetType, ResolvedInvalidatesProps } from './invalidate'
import type { MutationModeProps, ResolvedMutationModeProps } from './mutation-mode'
import type { NotifyProps } from './notify'
import type { PublishPayload } from './publish'
import type { QueryPair } from './types'
import { NotificationType } from '../notification'
import { RealtimeAction } from '../realtime/event'
import { AbortDefer, defer } from '../utils/defer'
import { getErrorMessage } from '../utils/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createBaseQueryKey as genBaseGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'
import { fakeMany } from './helper'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from './invalidate'
import { createRemoveListItemUpdaterFn, createRemoveManyUpdaterFn, MutationMode, resolveMutationModeProps } from './mutation-mode'
import { createProgressNotifyParams, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createPublishMeta, createPublishPayloadByMany } from './publish'
import { createQueryKey as genResourceQueryKey } from './resource'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& DeleteManyProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<DeleteManyResult<TData>, DeleteManyProps<TParams>, TError>
	& MutationModeProps
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& MutationProps<TData, TError, TParams>
	& ResolvedFetcherProps
	& ResolvedInvalidatesProps
	& ResolvedMutationModeProps
>

export interface MutationContext<
	TData extends BaseRecord,
> {
	previousQueries: QueryPair<TData>[]
}

export type MutationOptions<
	TData extends BaseRecord,
	TError,
	TParams,
> = MutationObserverOptions<
	DeleteManyResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>,
	MutationContext<TData>
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
	notify: NotifyFn
	translate: TranslateFn<unknown>
}

export function createMutationFn<
	TData extends BaseRecord,
	TParams,
>(
	{
		fetchers,
		notify,
		translate,
	}: CreateMutationFnProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['mutationFn']> {
	return async function mutationFn(props) {
		const resolvedProps = resolveMutationProps(props)

		const fetcher = getFetcher(resolvedProps, fetchers)
		const mutateFn = () => typeof fetcher.deleteMany === 'function'
			? fetcher.deleteMany<TData, TParams>(resolvedProps)
			: fakeMany(resolvedProps.ids.map(id => fetcher.deleteOne<TData, TParams>({ ...resolvedProps, id })))

		switch (resolvedProps.mutationMode) {
			case MutationMode.Undoable: {
				const deferResult = defer(mutateFn)

				notify(
					createProgressNotifyParams({
						method: 'deleteMany',
						props: resolvedProps,
						defer: deferResult,
						translate,
					}),
				)

				const result = await deferResult.promise
				return result
			}
			case MutationMode.Optimistic:
			case MutationMode.Pessimistic: {
				const result = await mutateFn()
				return result
			}
		}
	}
}

export interface CreateMutateHandlerProps<
	TData extends BaseRecord,
	TParams,
> {
	queryClient: QueryClient
	notify: NotifyFn
	translate: TranslateFn<unknown>
	onMutate: MutationOptions<TData, unknown, TParams>['onMutate']
}

export function createMutateHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		queryClient,
		notify,
		translate,
		onMutate: onMutateFromProp,
	}: CreateMutateHandlerProps<TData, TParams>,
): NonNullable<MutationOptions<TData, unknown, TParams>['onMutate']> {
	return async function onMutate(props) {
		const resolvedProps = resolveMutationProps(props)

		const resourceQueryKey = genResourceQueryKey({ props: resolvedProps })

		const previousQueries: QueryPair<TData>[] = queryClient.getQueriesData<TData>({
			queryKey: resourceQueryKey,
		})

		await queryClient.cancelQueries(
			{
				queryKey: resourceQueryKey,
			},
			{
				silent: true,
			},
		)

		switch (resolvedProps.mutationMode) {
			case MutationMode.Optimistic: {
				updateCache(
					resolvedProps,
					queryClient,
				)

				setTimeout(() => {
					dispatchSuccessNotify(
						notify,
						translate,
						{ data: resolvedProps.params },
						resolvedProps,
					)
				}, 0)

				break
			}
			case MutationMode.Undoable: {
				updateCache(
					resolvedProps,
					queryClient,
				)
				break
			}
		}

		const resultFromCallback = await onMutateFromProp?.(resolvedProps)

		return {
			...resultFromCallback,
			previousQueries,
		}
	}
}

export interface CreateSettledHandlerProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	queryClient: QueryClient
	onSettled: MutationOptions<TData, TError, TParams>['onSettled']
}

export function createSettledHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		queryClient,
		onSettled: onSettledFromProp,
	}: CreateSettledHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onSettled']> {
	return async function onSettled(
		data,
		error,
		props,
		context,
	) {
		const resolvedProps = resolveMutationProps(props)

		await triggerInvalidates(resolvedProps, queryClient)

		// eslint-disable-next-line ts/no-use-before-define
		cacheResolvedProps.delete(props)

		await onSettledFromProp?.(data, error, resolvedProps, context)
	}
}

export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TParams,
> {
	queryClient: QueryClient
	notify: NotifyFn
	translate: TranslateFn<unknown>
	publish: Publish.EmitFn<PublishPayload>
	onSuccess: MutationOptions<TData, unknown, TParams>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		queryClient,
		notify,
		translate,
		publish,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TParams>,
): NonNullable<MutationOptions<TData, unknown, TParams>['onSuccess']> {
	return async function onSuccess(
		data,
		props,
		context,
	) {
		const resolvedProps = resolveMutationProps(props)

		switch (resolvedProps.mutationMode) {
			case MutationMode.Pessimistic:
				updateCache(resolvedProps, queryClient)
				dispatchSuccessNotify(notify, translate, data, resolvedProps)
				break
			case MutationMode.Undoable:
				dispatchSuccessNotify(notify, translate, data, resolvedProps)
				break
		}

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
	queryClient: QueryClient
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
		queryClient,
		notify,
		translate,
		checkError,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TError, TParams>,
): NonNullable<MutationOptions<any, TError, any>['onError']> {
	return async function onError(error, variables, context) {
		const resolvedProps = resolveMutationProps(variables)

		if (context) {
			for (const query of context.previousQueries)
				queryClient.setQueryData(query[0], query[1])
		}

		if (!(error instanceof AbortDefer)) {
			await checkError(error)

			notify(
				resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
				{
					key: `${resolvedProps.resource}-${resolvedProps.ids}-notification`,
					message: translate('notifications.deleteError'),
					description: getErrorMessage(error),
					type: NotificationType.Error,
				},
			)
		}

		await onErrorFromProp?.(error, resolvedProps, context)
	}
}

function createPublishEvent(
	resolvedProps: ResolvedMutationProps<any, any, any>,
	data: DeleteManyResult,
): Publish.EmitEvent<PublishPayload> {
	const payload = createPublishPayloadByMany(resolvedProps, data)
	const meta = createPublishMeta(resolvedProps)

	return {
		channel: `resources/${resolvedProps.resource}`,
		action: RealtimeAction.Deleted,
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
		...resolveMutationModeProps(props),
	}
	cacheResolvedProps.set(props, result)

	return result
}

function updateCache<
	TData extends BaseRecord,
>(
	props: ResolvedMutationProps<TData, any, any>,
	queryClient: QueryClient,
) {
	queryClient.setQueriesData(
		{
			queryKey: genBaseGetListQueryKey({ props }),
		},
		createRemoveListItemUpdaterFn<TData>(props.ids),
	)
	queryClient.setQueriesData(
		{
			queryKey: genBaseGetManyQueryKey({ props }),
		},
		createRemoveManyUpdaterFn<TData>(props.ids),
	)
	for (const id of props.ids) {
		queryClient.removeQueries(
			{
				queryKey: genGetOneQueryKey({ props: { ...props, id } }),
			},
		)
	}
}

function dispatchSuccessNotify<
	TData extends BaseRecord,
>(
	notify: NotifyFn,
	translate: TranslateFn<any>,
	data: DeleteManyResult<TData>,
	resolvedProps: ResolvedMutationProps<any, any, any>,
) {
	notify(
		resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
		{
			key: `${resolvedProps.resource}-${resolvedProps.ids}-notification`,
			message: translate('notifications.deleteSuccess'),
			description: translate('notifications.success'),
			type: NotificationType.Success,
		},
	)
}
