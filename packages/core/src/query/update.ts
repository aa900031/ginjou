import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import type { CheckError } from '../auth'
import type { TranslateFn } from '../i18n'
import type { NotifyFn } from '../notification'
import type { Publish } from '../realtime'
import type { BaseRecord, UpdateProps, UpdateResult } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { InvalidatesProps, InvalidateTargetType, ResolvedInvalidatesProps } from './invalidate'
import type { MutationModeProps, ResolvedMutationModeProps } from './mutation-mode'
import type { NotifyProps } from './notify'
import type { PublishPayload } from './publish'
import type { OptionalMutateAsyncFunction, OptionalMutateSyncFunction, OriginMutateAsyncFunction, OriginMutateSyncFunction, QueryPair } from './types'
import { NotificationType } from '../notification'
import { RealtimeAction } from '../realtime/event'
import { AbortDefer, defer } from '../utils/defer'
import { getErrorMessage } from '../utils/error'
import { getFetcher, resolveFetcherProps } from './fetchers'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createBaseQueryKey as genBaseGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from './invalidate'
import { createModifyListItemUpdaterFn, createModifyManyUpdaterFn, createModifyOneUpdaterFn, MutationMode, resolveMutationModeProps } from './mutation-mode'
import { createProgressNotifyParams, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createPublishMeta, createPublishPayloadByOne } from './publish'
import { createQueryKey as genResourceQueryKey } from './resource'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& Partial<UpdateProps<TParams>>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<UpdateResult<TData>, UpdateProps<TParams>, TError>
	& MutationModeProps
>

export type ResolvedMutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& MutationProps<TData, TError, TParams>
	& UpdateProps<TParams>
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
	UpdateResult<TData>,
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
	UpdateResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>,
	MutationContext<TData>
>

export type MutateAsyncFn<
	TData extends BaseRecord,
	TError,
	TParams,
> = OptionalMutateAsyncFunction<
	UpdateResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>,
	MutationContext<TData>
>

export interface CreateMutationFnProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	fetchers: Fetchers
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => Props<TData, TError, TParams> | undefined,
}

export function createMutationFn<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		fetchers,
		notify,
		translate,
		getProps,
	}: CreateMutationFnProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['mutationFn']> {
	return async function mutationFn(props) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		const fetcher = getFetcher(resolvedProps, fetchers)
		const mutateFn = () => fetcher.update<TData, TParams>(resolvedProps)

		switch (resolvedProps.mutationMode) {
			case MutationMode.Undoable: {
				const deferResult = defer(mutateFn)

				notify(
					createProgressNotifyParams({
						method: 'update',
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
	TError,
	TParams,
> {
	queryClient: QueryClient
	notify: NotifyFn
	translate: TranslateFn<unknown>
	getProps: () => Props<TData, TError, TParams> | undefined
	onMutate: MutationOptions<TData, TError, TParams>['onMutate']
}

export function createMutateHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		queryClient,
		notify,
		translate,
		getProps,
		onMutate: onMutateFromProp,
	}: CreateMutateHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onMutate']> {
	return async function onMutate(props) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		const resourceQueryKey = genResourceQueryKey({ props: resolvedProps })

		const previousQueries: QueryPair<TData>[] = queryClient.getQueriesData<TData>({
			queryKey: resourceQueryKey,
		})

		await queryClient.cancelQueries({
			queryKey: resourceQueryKey,
		}, {
			silent: true,
		})

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
						{ data: resolvedProps.params } as unknown as UpdateResult<TData>,
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
	getProps: () => Props<TData, TError, TParams> | undefined
	onSettled: MutationOptions<TData, TError, TParams>['onSettled']
}

export function createSettledHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		queryClient,
		getProps,
		onSettled: onSettledFromProp,
	}: CreateSettledHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onSettled']> {
	return async function onSettled(
		data,
		error,
		props,
		context,
	) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		await triggerInvalidates(resolvedProps, queryClient)

		await onSettledFromProp?.(data, error, resolvedProps, context)
	}
}

export interface CreateSuccessHandlerProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	queryClient: QueryClient
	notify: NotifyFn
	translate: TranslateFn<unknown>
	publish: Publish.EmitFn<PublishPayload>
	getProps: () => Props<TData, TError, TParams> | undefined
	onSuccess: MutationOptions<TData, TError, TParams>['onSuccess']
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		queryClient,
		notify,
		translate,
		publish,
		getProps,
		onSuccess: onSuccessFromProp,
	}: CreateSuccessHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onSuccess']> {
	return async function onSuccess(
		data,
		props,
		context,
	) {
		const resolvedProps = resolveMutationProps(getProps(), props)

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
	TData extends BaseRecord,
	TError,
	TParams,
> {
	queryClient: QueryClient
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutationFn<TError>
	getProps: () => Props<TData, TError, TParams> | undefined
	onError: MutationOptions<TData, TError, TParams>['onError']
}

export function createErrorHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		queryClient,
		notify,
		translate,
		checkError,
		getProps,
		onError: onErrorFromProp,
	}: CreateErrorHandlerProps<TData, TError, TParams>,
): NonNullable<MutationOptions<TData, TError, TParams>['onError']> {
	return async function onError(error, props, context) {
		const resolvedProps = resolveMutationProps(getProps(), props)

		if (context) {
			for (const query of context.previousQueries)
				queryClient.setQueryData(query[0], query[1])
		}

		if (!(error instanceof AbortDefer)) {
			await checkError(error)

			notify(
				resolveErrorNotifyParams(resolvedProps.errorNotify, error, resolvedProps),
				{
					key: `update-${resolvedProps.resource}-notification`,
					message: translate('notifications.updateError'),
					description: getErrorMessage(error),
					type: NotificationType.Error,
				},
			)
		}

		await onErrorFromProp?.(error, resolvedProps, context)
	}
}

export interface CreateMutateFnProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	originFn: OriginMutateSyncFunction<
		UpdateResult<TData>,
		TError,
		MutationProps<TData, TError, TParams>,
		MutationContext<TData>
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
		UpdateResult<TData>,
		TError,
		MutationProps<TData, TError, TParams>,
		MutationContext<TData>
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
	data: UpdateResult,
): Publish.EmitEvent<PublishPayload> {
	const payload = createPublishPayloadByOne(resolvedProps, data)
	const meta = createPublishMeta(resolvedProps)

	return {
		channel: `resources/${resolvedProps.resource}`,
		action: RealtimeAction.Updated,
		payload,
		meta,
	}
}

const DEFAULT_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
	InvalidateTarget.One,
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
		...resolveMutationModeProps(props),
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
): MutationProps<TData, TError, TParams> & UpdateProps<TParams> {
	const props = {
		...propsFromProps,
		...propsFromFn,
	}
	if (props.resource == null || props.id == null || props.params == null)
		throw new Error('No') // TODO:

	return props as any
}

function updateCache<
	TData extends BaseRecord,
	TParams,
>(
	props: ResolvedMutationProps<TData, any, TParams>,
	queryClient: QueryClient,
) {
	queryClient.setQueriesData(
		{ queryKey: genBaseGetListQueryKey({ props }) },
		createModifyListItemUpdaterFn<TData, TParams>(props.id, props.params),
	)
	queryClient.setQueriesData(
		{ queryKey: genBaseGetManyQueryKey({ props }) },
		createModifyManyUpdaterFn<TData, TParams>(props.id, props.params),
	)
	queryClient.setQueriesData(
		{ queryKey: genGetOneQueryKey({ props }) },
		createModifyOneUpdaterFn<TData, TParams>(props.params),
	)
}

function dispatchSuccessNotify<
	TData extends BaseRecord,
>(
	notify: NotifyFn,
	translate: TranslateFn<any>,
	data: UpdateResult<TData>,
	resolvedProps: ResolvedMutationProps<TData, any, any>,
) {
	notify(
		resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
		{
			key: `update-${resolvedProps.resource}-notification`,
			message: translate('notifications.updateSuccess'),
			description: translate('notifications.success'),
			type: NotificationType.Success,
		},
	)
}
