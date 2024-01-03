import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient, QueryKey } from '@tanstack/query-core'
import type { InvalidateTargetType, InvalidatesProps } from '../query/invalidate'
import { InvalidateTarget, triggerInvalidates } from '../query/invalidate'
import type { BaseRecord, UpdateProps, UpdateResult } from '../query/fetcher'
import { type Fetchers, getFetcher } from '../query/fetchers'
import type { QueryPair } from '../query/types'
import { NotificationType, type NotifyFn } from '../notification'
import type { TranslateFn } from '../i18n'
import type { CheckErrorMutationFn } from '../auth'
import { getErrorMessage } from '../controller/error'
import type { FetcherProps } from './fetchers'
import { type NotifyProps, resolveErrorNotifyParams, resolveSuccessNotifyParams } from './notify'

export type MutationProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = Simplify<
	& UpdateProps<TParams>
	& FetcherProps
	& InvalidatesProps
	& NotifyProps<UpdateResult<TData>, UpdateProps<TParams>, TError>
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

		const fetcher = getFetcher(props, fetchers)
		const result = await fetcher.update<TData, TParams>(props)
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
		const resourceQueryKey: QueryKey = [
			props.fetcherName ?? 'default', // TODO: default
			props.resource,
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
		await triggerInvalidates({
			...props,
			// eslint-disable-next-line ts/no-use-before-define
			invalidates: props.invalidates ?? DEFAULT_UPDATE_INVALIDATES,
		}, queryClient)
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
	return async function onSucces(data, props) {
		const {
			resource,
			successNotify,
		} = props

		notify(
			resolveSuccessNotifyParams(successNotify, data, props),
			{
				key: `update-${resource}-notification`,
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

		const {
			resource,
			errorNotify,
		} = variables

		notify(
			resolveErrorNotifyParams(errorNotify, error, variables),
			{
				key: `update-${resource}-notification`,
				message: translate('notifications.updateError'),
				description: getErrorMessage(error),
				type: NotificationType.Error,
			},
		)
	}
}

const DEFAULT_UPDATE_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
	InvalidateTarget.One,
]

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
