import type { MutateFunction, MutationFunction, QueryClient } from '@tanstack/query-core'
import { type DeferFn, deferWith } from './defer'
import { InvalidateTarget, type InvalidateTargetType, triggerInvalidates } from './invalidate'
import { fakeMany } from './helper'
import { genGetListQueryKey } from './get-list'
import { genGetManyQueryKey } from './get-many'
import { genGetOneQueryKey } from './get-one'
import type { ErrorHandler, MutateHandler, QueryPair, SettledHandler } from './types'
import type { UpdateMutationContext } from './update'
import { genResourceQueryKey } from './resource'
import type { BaseRecord, GetListResult, GetManyResult, GetOneResult, UpdateManyProps, UpdateManyResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_UPDATE_MANY_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
	InvalidateTarget.One,
]

export type UpdateManyMutationProps<
	TParams = Record<string, any>,
> =
	& UpdateManyProps<TParams>
	& {
		fetcherName?: string
		defer?: DeferFn
		invalidates?: InvalidateTargetType[]
	}

export type UpdateManyMutateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
> = MutateFunction<
	UpdateManyResult<TData>,
	TError,
	UpdateManyMutationProps<TParams>,
	UpdateMutationContext<TData>
>

export function createUpdateManyMutationFn<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	fetchers: Fetchers,
): MutationFunction<UpdateManyResult<TData>, UpdateManyMutationProps<TParams>> {
	return async function updateManyMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)

		const action = () => typeof fetcher.updateMany === 'function'
			? fetcher.updateMany<TData, TParams>(props)
			: fakeMany(props.ids.map(id => fetcher.update<TData, TParams>({ ...props, id })))

		if (props.defer) {
			const result = await deferWith(
				props.defer,
				action,
				() => updateCache(queryClient, props, {
					data: props.ids.map(id => ({
						id,
						...props.params,
					})),
				} as unknown as UpdateManyResult<TData>),
			)
			updateCache(queryClient, props, result)
			return result
		}
		else {
			const result = await action()
			updateCache(queryClient, props, result)
			return result
		}
	}
}

export function createUpdateManyMutateHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): MutateHandler<UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>> {
	return async function updateManyMutateHandler(props) {
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

export function createUpdateManySettledHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): SettledHandler<TData, TError, UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>> {
	return async function updateSettledHandler(
		_data,
		_error,
		props,
	) {
		await triggerInvalidates({
			...props,
			invalidates: props.invalidates ?? DEFAULT_UPDATE_MANY_INVALIDATES,
		}, queryClient)
	}
}

export function createUpdateManyErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): ErrorHandler<TError, UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>> {
	return function updateManyErrorHandler(
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

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	props: UpdateManyMutationProps<TParams>,
	result: UpdateManyResult<TData>,
): void {
	const dataMap = result.data.reduce((obj, item) => {
		if (item.id != null)
			obj[item.id] = item
		return obj
	}, {} as Record<string, TData>)

	queryClient.setQueriesData<GetListResult<TData>>(
		genGetListQueryKey({
			resource: props.resource,
			fetcherName: props.fetcherName,
			meta: props.meta,
		}),
		(previous) => {
			if (!previous)
				return

			const data = previous.data.map((record: TData) => {
				if (record.id != null && record.id in dataMap) {
					return {
						...record,
						...dataMap[record.id],
					}
				}

				return record
			})

			return {
				...previous,
				data,
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

			const data = previous.data.map((record: TData) => {
				if (record.id != null && record.id in dataMap) {
					return {
						...record,
						...dataMap[record.id],
					}
				}

				return record
			})

			return {
				...previous,
				data,
			}
		},
	)

	for (const id of props.ids) {
		if (!(id in dataMap))
			continue

		queryClient.setQueriesData<GetOneResult<TData>>(
			genGetOneQueryKey({
				id,
				resource: props.resource,
				meta: props.meta,
			}),
			(previous) => {
				if (!previous)
					return

				return {
					...previous,
					data: {
						...previous.data,
						...dataMap[id],
					},
				}
			},
		)
	}
}
