import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient } from '@tanstack/query-core'
import type { NotifyFn } from '../notification'
import { NotificationType } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckError } from '../auth'
import { getErrorMessage } from '../utils/error'
import { AbortDefer, defer } from '../utils/defer'
import type { QueryPair } from './types'
import type { InvalidateTargetType, InvalidatesProps, ResolvedInvalidatesProps } from './invalidate'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from './invalidate'
import { fakeMany } from './helper'
import { getFetcher, resolveFetcherProps } from './fetchers'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { BaseRecord, UpdateManyProps, UpdateManyResult } from './fetcher'
import type { NotifyProps } from './notify'
import { createProgressNotifyParams, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import type { MutationModeProps, ResolvedMutationModeProps } from './mutation-mode'
import { MutationMode, createModifyListItemUpdaterFn, createModifyManyUpdaterFn, createModifyOneUpdaterFn, resolveMutationModeProps } from './mutation-mode'
import { createBaseQueryKey as genBaseGetListQueryKey } from './get-list'
import { createBaseQueryKey as genBaseGetManyQueryKey } from './get-many'
import { createQueryKey as genGetOneQueryKey } from './get-one'
import { createQueryKey as genResourceQueryKey } from './resource'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& UpdateManyProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<UpdateManyResult<TData>, UpdateManyProps<TParams>, TError>
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
	UpdateManyResult<TData>,
	TError,
	MutationProps<TData, TError, TParams>,
	MutationContext<TData>
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
		const mutateFn = () => typeof fetcher.updateMany === 'function'
			? fetcher.updateMany<TData, TParams>(resolvedProps)
			: fakeMany(resolvedProps.ids.map(id => fetcher.update<TData, TParams>({ ...resolvedProps, id })))

		if (resolvedProps.mutationMode === MutationMode.Undoable) {
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

		const result = await mutateFn()
		return result
	}
}

export interface CreateMutateHandlerProps {
	queryClient: QueryClient
}

export function createMutateHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		queryClient,
	}: CreateMutateHandlerProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['onMutate']> {
	return async function onMutate(props) {
		const resolvedProps = resolveMutationProps(props)

		const resourceQueryKey = genResourceQueryKey({ props: resolvedProps })

		const previousQueries: QueryPair<TData>[] = queryClient.getQueriesData<TData>(resourceQueryKey)

		await queryClient.cancelQueries(
			resourceQueryKey,
			undefined,
			{
				silent: true,
			},
		)

		if (resolvedProps.mutationMode !== MutationMode.Pessimistic) {
			updateCache(
				resolvedProps,
				queryClient,
			)
		}

		return {
			previousQueries,
		}
	}
}

export interface CreateSettledHandlerProps {
	queryClient: QueryClient
}

export function createSettledHandler<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	{
		queryClient,
	}: CreateSettledHandlerProps,
): NonNullable<MutationOptions<TData, TError, TParams>['onSettled']> {
	return async function onSettled(
		_data,
		_error,
		props,
	) {
		const resolvedProps = resolveMutationProps(props)

		await triggerInvalidates(resolvedProps, queryClient)

		// eslint-disable-next-line ts/no-use-before-define
		cacheResolvedProps.delete(props)
	}
}

export interface CreateSuccessHandlerProps {
	notify: NotifyFn
	translate: TranslateFn<unknown>
	queryClient: QueryClient
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		notify,
		translate,
		queryClient,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['onSuccess']> {
	return async function onSuccess(data, props) {
		const resolvedProps = resolveMutationProps(props)

		if (resolvedProps.mutationMode === MutationMode.Pessimistic) {
			updateCache(
				resolvedProps,
				queryClient,
			)
		}

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
			{
				key: `update-${resolvedProps.resource}-notification`,
				message: translate('notifications.updateSuccess'),
				description: translate('notifications.success'),
				type: NotificationType.Success,
			},
		)

		// TODO: publish
		// TODO: logs
	}
}

export interface CreateErrorHandlerProps {
	queryClient: QueryClient
	notify: NotifyFn
	translate: TranslateFn<unknown>
	checkError: CheckError.MutationFn<unknown>
}

export function createErrorHandler<
	TError,
>(
	{
		queryClient,
		notify,
		translate,
		checkError,
	}: CreateErrorHandlerProps,
): NonNullable<MutationOptions<any, TError, any>['onError']> {
	return async function onError(error, variables, context) {
		if (context) {
			for (const query of context.previousQueries)
				queryClient.setQueryData(query[0], query[1])
		}

		if (error instanceof AbortDefer)
			return

		await checkError(error)

		const resolvedProps = resolveMutationProps(variables)

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
}

const DEFAULT_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
	InvalidateTarget.One,
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
	TParams,
>(
	props: ResolvedMutationProps<TData, any, TParams>,
	queryClient: QueryClient,
) {
	queryClient.setQueriesData(
		genBaseGetListQueryKey({ props }),
		createModifyListItemUpdaterFn<TData, TParams>(props.ids, props.params),
	)
	queryClient.setQueriesData(
		genBaseGetManyQueryKey({ props }),
		createModifyManyUpdaterFn<TData, TParams>(props.ids, props.params),
	)
	for (const id of props.ids) {
		queryClient.setQueriesData(
			genGetOneQueryKey({ props: { ...props, id } }),
			createModifyOneUpdaterFn(props.params),
		)
	}
}
