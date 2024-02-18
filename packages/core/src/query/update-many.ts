import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient, QueryKey } from '@tanstack/query-core'
import type { NotifyFn } from '../notification'
import { NotificationType } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckError } from '../auth'
import { getErrorMessage } from '../utils/error'
import type { QueryPair } from './types'
import type { InvalidateTargetType, InvalidatesProps, ResolvedInvalidatesProps } from './invalidate'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from './invalidate'
import { fakeMany } from './helper'
import { getFetcher, resolveFetcherProps } from './fetchers'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import type { BaseRecord, UpdateManyProps, UpdateManyResult } from './fetcher'
import type { NotifyProps } from './notify'
import { resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& UpdateManyProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<UpdateManyResult<TData>, UpdateManyProps<TParams>, TError>
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
		// TODO: undoable
		// TODO: mutation mode

		const resolvedProps = resolveMutationProps(props)

		const fetcher = getFetcher(resolvedProps, fetchers)
		const result = typeof fetcher.updateMany === 'function'
			? await fetcher.updateMany<TData, TParams>(resolvedProps)
			: await fakeMany(resolvedProps.ids.map(id => fetcher.update<TData, TParams>({ ...resolvedProps, id })))

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

		const resourceQueryKey: QueryKey = [
			resolvedProps.fetcherName,
			resolvedProps.resource,
		]

		const previousQueries: QueryPair<TData>[] = queryClient.getQueriesData<TData>(resourceQueryKey)

		await queryClient.cancelQueries(
			resourceQueryKey,
			undefined,
			{
				silent: true,
			},
		)

		// TODO: call updateCache for optimistic

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
}

export function createSuccessHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		notify,
		translate,
	}: CreateSuccessHandlerProps,
): NonNullable<MutationOptions<TData, unknown, TParams>['onSuccess']> {
	return async function onSuccess(data, props) {
		const resolvedProps = resolveMutationProps(props)

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
	}
	cacheResolvedProps.set(props, result)

	return result
}
// function updateCache<
// 	TData extends BaseRecord = BaseRecord,
// 	TParams = Record<string, any>,
// >(
// 	queryClient: QueryClient,
// 	props: MutationProps<TData, unknown, TParams>,
// 	result: UpdateManyResult<TData>,
// ): void {
// 	const dataMap = result.data.reduce((obj, item) => {
// 		if (item.id != null)
// 			obj[item.id] = item
// 		return obj
// 	}, {} as Record<string, TData>)

// 	queryClient.setQueriesData<GetListResult<TData>>(
// 		genGetListQueryKey({
// 			resource: props.resource,
// 			fetcherName: props.fetcherName,
// 			meta: props.meta,
// 		}),
// 		(previous) => {
// 			if (!previous)
// 				return

// 			const data = previous.data.map((record: TData) => {
// 				if (record.id != null && record.id in dataMap) {
// 					return {
// 						...record,
// 						...dataMap[record.id],
// 					}
// 				}

// 				return record
// 			})

// 			return {
// 				...previous,
// 				data,
// 			}
// 		},
// 	)

// 	queryClient.setQueriesData<GetManyResult<TData>>(
// 		genGetManyQueryKey({
// 			resource: props.resource,
// 			fetcherName: props.fetcherName,
// 			meta: props.meta,
// 		}),
// 		(previous) => {
// 			if (!previous)
// 				return

// 			const data = previous.data.map((record: TData) => {
// 				if (record.id != null && record.id in dataMap) {
// 					return {
// 						...record,
// 						...dataMap[record.id],
// 					}
// 				}

// 				return record
// 			})

// 			return {
// 				...previous,
// 				data,
// 			}
// 		},
// 	)

// 	for (const id of props.ids) {
// 		if (!(id in dataMap))
// 			continue

// 		queryClient.setQueriesData<GetOneResult<TData>>(
// 			genGetOneQueryKey({
// 				id,
// 				resource: props.resource,
// 				meta: props.meta,
// 			}),
// 			(previous) => {
// 				if (!previous)
// 					return

// 				return {
// 					...previous,
// 					data: {
// 						...previous.data,
// 						...dataMap[id],
// 					},
// 				}
// 			},
// 		)
// 	}
// }
