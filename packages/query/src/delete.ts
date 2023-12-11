import type { MutateFunction, MutationFunction, QueryClient } from '@tanstack/query-core'
import { type DeferFn, deferWith } from './defer'
import { InvalidateTarget, type InvalidateTargetType, triggerInvalidates } from './invalidate'
import type { ErrorHandler, MutateHandler, QueryPair, SettledHandler, SuccessHandler } from './types'
import { genResourceQueryKey } from './resource'
import { genGetListQueryKey } from './get-list'
import { genGetManyQueryKey } from './get-many'
import { genGetOneQueryKey } from './get-one'
import type { BaseRecord, DeleteOneProps, DeleteOneResult, GetListResult, GetManyResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_UPDATE_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

export type DeleteMutationProps<
	TParams = Record<string, any>,
> =
	& DeleteOneProps<TParams>
	& {
		fetcherName?: string
		defer?: DeferFn
		invalidates?: InvalidateTargetType[]
	}

export interface DeleteMutationContext<
	TData extends BaseRecord = BaseRecord,
> {
	previousQueries: QueryPair<TData>[]
}

export type DeleteMutateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
> = MutateFunction<
	DeleteOneResult<TData>,
	TError,
	DeleteMutationProps<TParams>,
	DeleteMutationContext<TData>
>

export function createDeleteMutationFn<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	fetchers: Fetchers,
): MutationFunction<DeleteOneResult<TData>, DeleteMutationProps<TParams>> {
	return async function deleteMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)

		if (props.defer) {
			const result = await deferWith(
				props.defer,
				() => fetcher.deleteOne<TData, TParams>(props),
				() => updateCache(queryClient, props),
			)
			updateCache(queryClient, props)
			return result
		}
		else {
			const result = await fetcher.deleteOne<TData, TParams>(props)
			updateCache(queryClient, props)
			return result
		}
	}
}

export function createDeleteMutateHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): MutateHandler<DeleteMutationProps<TParams>, DeleteMutationContext<TData>> {
	return async function deleteMutateHandler(props) {
		const resourceQueryKey = genResourceQueryKey(props)
		const previousQueries: QueryPair<TData>[] = queryClient.getQueriesData<TData>(resourceQueryKey)

		await queryClient.cancelQueries(
			resourceQueryKey,
			undefined,
			{
				silent: true,
			},
		)

		return {
			previousQueries,
		}
	}
}

export function createDeleteSettledHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): SettledHandler<TData, TError, DeleteMutationProps<TParams>, DeleteMutationContext<TData>> {
	return async function deleteSettledHandler(
		_data,
		_error,
		props,
	) {
		await triggerInvalidates({
			...props,
			invalidates: props.invalidates ?? DEFAULT_UPDATE_INVALIDATES,
		}, queryClient)
	}
}

export function createDeleteErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): ErrorHandler<TError, DeleteMutationProps<TParams>, DeleteMutationContext<TData>> {
	return function updateErrorHandler(
		_error,
		_variables,
		context,
	) {
		if (context) {
			for (const query of context.previousQueries)
				queryClient.setQueryData(query[0], query[1])
		}
	}
}

export function createDeleteSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): SuccessHandler<DeleteOneResult<TData>, DeleteMutationProps<TParams>> {
	return function deleteSuccessHandler(
		_data,
		props,
	) {
		queryClient.removeQueries(
			genGetOneQueryKey({
				id: props.id,
				resource: props.resource,
				meta: props.meta,
			}),
		)
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	props: DeleteMutationProps<TParams>,
): void {
	queryClient.setQueriesData<GetListResult<TData>>(
		genGetListQueryKey({
			resource: props.resource,
			fetcherName: props.fetcherName,
			meta: props.meta,
		}),
		(previous) => {
			if (!previous)
				return

			const data = previous.data.filter(
				(record: TData) =>
					record.id?.toString() !== props.id.toString(),
			)

			return {
				data,
				total: previous.total - 1,
			}
		},
	)

	queryClient.setQueriesData<GetManyResult<TData>>(
		genGetManyQueryKey({
			resource: props.resource,
			fetcherName: props.fetcherName,
			meta: props.meta,
		}),
		(previous) => {
			if (!previous)
				return

			const data = previous.data.filter(
				(record: TData) => {
					return (
						record.id?.toString() !== props.id?.toString()
					)
				},
			)

			return {
				...previous,
				data,
			}
		},
	)
}
