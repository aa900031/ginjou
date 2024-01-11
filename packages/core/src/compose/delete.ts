import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient, QueryKey } from '@tanstack/query-core'
import type { InvalidateTargetType, InvalidatesProps, ResolvedInvalidatesProps } from '../query/invalidate'
import { InvalidateTarget, resolveInvalidateProps, triggerInvalidates } from '../query/invalidate'
import type { BaseRecord, DeleteOneProps, DeleteOneResult } from '../query/fetcher'
import { type Fetchers, getFetcher } from '../query/fetchers'
import type { QueryPair } from '../query/types'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { getErrorMessage } from '../controller/error'
import type { FetcherProps, ResolvedFetcherProps } from './fetchers'
import { resolveFetcherProps } from './fetchers'
import { type NotifyProps, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'
import { createQueryKey as genGetOneQueryKey } from './get-one'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& DeleteOneProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<DeleteOneResult<TData>, DeleteOneProps<TParams>, TError>
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
	DeleteOneResult<TData>,
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
		const result = await fetcher.deleteOne<TData, TParams>(resolvedProps)

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

		queryClient.removeQueries(
			genGetOneQueryKey({
				props: resolvedProps,
			}),
		)

		notify(
			resolveSuccessNotifyParams(resolvedProps.successNotify, data, resolvedProps),
			{
				key: `${resolvedProps.resource}-${resolvedProps.id}-notification`,
				message: translate('notifications.deleteSuccess'),
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
	checkError: CheckErrorMutationFn<unknown>
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
				key: `${resolvedProps.resource}-${resolvedProps.id}-notification`,
				message: translate('notifications.deleteError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
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

// function updateCache<
// 	TData extends BaseRecord,
// 	TParams,
// >(
// 	queryClient: QueryClient,
// 	props: MutationProps<TData, unknown, TParams>,
// ): void {
// 	queryClient.setQueriesData<GetListResult<TData>>(
// 		genGetListQueryKey<number>({ props }),
// 		(previous) => {
// 			if (!previous)
// 				return

// 			const data = previous.data.map((record: TData) => {
// 				if (record.id?.toString() === props.id?.toString()) {
// 					return {
// 						id: props.id,
// 						...record,
// 						...props.params,
// 					} as unknown as TData
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
// 		genGetManyQueryKey({ props }),
// 		(previous) => {
// 			if (!previous)
// 				return

// 			const data = previous.data.map((record: TData) => {
// 				if (record.id?.toString() === props.id?.toString()) {
// 					record = {
// 						id: props.id,
// 						...record,
// 						...props.params,
// 					} as unknown as TData
// 				}
// 				return record
// 			})
// 			return {
// 				...previous,
// 				data,
// 			}
// 		},
// 	)

// 	queryClient.setQueriesData<GetOneResult<TData>>(
// 		genGetOneQueryKey({ props }),
// 		(previous) => {
// 			if (!previous)
// 				return

// 			return {
// 				...previous,
// 				data: {
// 					...previous.data,
// 					...props.params,
// 				},
// 			}
// 		},
// 	)
// }
