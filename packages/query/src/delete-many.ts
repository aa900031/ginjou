import type { MutateFunction, MutationFunction, QueryClient } from '@tanstack/query-core'
import { type DeferFn, deferWith } from './defer'
import { InvalidateTarget, type InvalidateTargetType, triggerInvalidates } from './invalidate'
import { fakeMany } from './helper'
import { genGetListQueryKey } from './get-list'
import { genGetManyQueryKey } from './get-many'
import { genGetOneQueryKey } from './get-one'
import type { ErrorHandler, MutateHandler, QueryPair, SettledHandler, SuccessHandler } from './types'
import type { DeleteMutationContext } from './delete'
import { genResourceQueryKey } from './resource'
import type { BaseRecord, DeleteManyProps, DeleteManyResult, GetListResult, GetManyResult, GetOneResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_DELETE_MANY_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

export type DeleteManyMutationProps<
	TParams = Record<string, any>,
> =
	& DeleteManyProps<TParams>
	& {
		fetcherName?: string
		defer?: DeferFn
		invalidates?: InvalidateTargetType[]
	}

export type DeleteManyMutateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
> = MutateFunction<
	DeleteManyResult<TData>,
	TError,
	DeleteManyMutationProps<TParams>,
	DeleteMutationContext<TData>
>

export function createDeleteManyMutationFn<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	fetchers: Fetchers,
): MutationFunction<DeleteManyResult<TData>, DeleteManyMutationProps<TParams>> {
	return async function deleteManyMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)
		const action = () => typeof fetcher.deleteMany === 'function'
			? fetcher.deleteMany<TData, TParams>(props)
			: fakeMany(props.ids.map(id => fetcher.deleteOne<TData, TParams>({ ...props, id })))

		if (props.defer) {
			const result = await deferWith(
				props.defer,
				action,
				() => updateCache(queryClient, props),
			)
			updateCache(queryClient, props)
			return result
		}
		else {
			const result = await action()
			updateCache(queryClient, props)
			return result
		}
	}
}

export function createDeleteManyMutateHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): MutateHandler<DeleteManyMutationProps<TParams>, DeleteMutationContext<TData>> {
	return async function deleteManyMutateHandler(props) {
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

export function createDeleteManySettledHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): SettledHandler<TData, TError, DeleteManyMutationProps<TParams>, DeleteMutationContext<TData>> {
	return async function updateSettledHandler(
		_data,
		_error,
		props,
	) {
		await triggerInvalidates({
			...props,
			invalidates: props.invalidates ?? DEFAULT_DELETE_MANY_INVALIDATES,
		}, queryClient)
	}
}

export function createDeleteManyErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): ErrorHandler<TError, DeleteManyMutationProps<TParams>, DeleteMutationContext<TData>> {
	return function deleteManyErrorHandler(
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

export function createDeleteManySuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): SuccessHandler<DeleteManyResult<TData>, DeleteManyMutationProps<TParams>> {
	return function deleteManySuccessHandler(
		_data,
		props,
	) {
		for (const id of props.ids) {
			queryClient.removeQueries(
				genGetOneQueryKey({
					id,
					resource: props.resource,
					meta: props.meta,
				}),
			)
		}
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	props: DeleteManyMutationProps<TParams>,
): void {
	const idSet = new Set(props.ids)

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
				item => item.id && idSet.has(item.id.toString()),
			)

			return {
				data,
				total: previous.total - idSet.size,
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
				item => item.id && idSet.has(item.id.toString()),
			)

			return {
				...previous,
				data,
			}
		},
	)

	for (const id of props.ids) {
		queryClient.setQueriesData<GetOneResult<TData>>(
			genGetOneQueryKey({
				id,
				resource: props.resource,
				meta: props.meta,
			}),
			(previous) => {
				if (!previous || previous.data.id?.toString() === id.toString())
					return

				return {
					...previous,
				}
			},
		)
	}
}
