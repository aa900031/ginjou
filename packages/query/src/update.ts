import type { MutateFunction, MutationFunction, QueryClient } from '@tanstack/query-core'
import { type DeferFn, deferWith } from './defer'
import { genGetListQueryKey } from './get-list'
import { genGetManyQueryKey } from './get-many'
import { genGetOneQueryKey } from './get-one'
import type { ErrorHandler, MutateHandler, QueryPair, SettledHandler } from './types'
import { genResourceQueryKey } from './resource'
import type { InvalidateTargetType } from './invalidate'
import { InvalidateTarget, triggerInvalidates } from './invalidate'
import type { BaseRecord, GetListResult, GetManyResult, GetOneResult, UpdateProps, UpdateResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_UPDATE_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
	InvalidateTarget.One,
]

export type UpdateMutationProps<
	TParams = Record<string, any>,
> =
	& UpdateProps<TParams>
	& {
		fetcherName?: string
		defer?: DeferFn
		invalidates?: InvalidateTargetType[]
	}

export interface UpdateMutationContext<
	TData extends BaseRecord = BaseRecord,
> {
	previousQueries: QueryPair<TData>[]
}

export type UpdateMutateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
> = MutateFunction<
	UpdateResult<TData>,
	TError,
	UpdateMutationProps<TParams>,
	UpdateMutationContext<TData>
>

export function createUpdateMutationFn<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	fetchers: Fetchers,
): MutationFunction<UpdateResult<TData>, UpdateMutationProps<TParams>> {
	return async function updateMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)

		if (props.defer) {
			const result = await deferWith(
				props.defer,
				() => fetcher.update<TData, TParams>(props),
				() => updateCache(queryClient, props, { data: props.params } as unknown as UpdateResult<TData>),
			)
			updateCache(queryClient, props, result)
			return result
		}
		else {
			const result = await fetcher.update<TData, TParams>(props)
			updateCache(queryClient, props, result)
			return result
		}
	}
}

export function createUpdateMutateHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): MutateHandler<UpdateMutationProps<TParams>, UpdateMutationContext<TData>> {
	return async function updateMutateHandler(props) {
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

export function createUpdateSettledHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): SettledHandler<TData, TError, UpdateMutationProps<TParams>, UpdateMutationContext<TData>> {
	return async function updateSettledHandler(
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

export function createUpdateErrorHandler<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	queryClient: QueryClient,
): ErrorHandler<TError, UpdateMutationProps<TParams>, UpdateMutationContext<TData>> {
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

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	props: UpdateMutationProps<TParams>,
	result: UpdateResult<TData>,
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

			const data = previous.data.map((record: TData) => {
				if (record.id?.toString() === props.id?.toString()) {
					return {
						id: props.id,
						...record,
						...result,
					} as unknown as TData
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
				if (record.id?.toString() === props.id?.toString()) {
					record = {
						id: props.id,
						...record,
						...result,
					} as unknown as TData
				}
				return record
			})
			return {
				...previous,
				data,
			}
		},
	)

	queryClient.setQueriesData<GetOneResult<TData>>(
		genGetOneQueryKey({
			resource: props.resource,
			id: props.id,
			meta: props.meta,
		}),
		(previous) => {
			if (!previous)
				return

			return {
				...previous,
				data: {
					...previous.data,
					...result.data,
				},
			}
		},
	)
}
