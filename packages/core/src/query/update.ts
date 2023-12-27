import type { MutateFunction, MutationOptions, QueryClient } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import { type DeferFn, deferWith } from './defer'
import { genGetListQueryKey } from './get-list'
import { genGetManyQueryKey } from './get-many'
import { genGetOneQueryKey } from './get-one'
import type { QueryPair } from './types'
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
> = Simplify<
	& UpdateProps<TParams>
	& {
		fetcherName?: string
		defer?: DeferFn
		invalidates?: InvalidateTargetType[]
	}
>

export interface UpdateMutationContext<
	TData extends BaseRecord = BaseRecord,
> {
	previousQueries: QueryPair<TData>[]
}

export type UpdateMutationOptions<
	TData extends BaseRecord,
	TError,
	TParams,
> = MutationOptions<
	UpdateResult<TData>,
	TError,
	UpdateMutationProps<TParams>,
	UpdateMutationContext<TData>
>

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
): NonNullable<UpdateMutationOptions<TData, unknown, TParams>['mutationFn']> {
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
	onMutate?: UpdateMutationOptions<TData, unknown, TParams>['onMutate'],
): NonNullable<UpdateMutationOptions<TData, unknown, TParams>['onMutate']> {
	return async function updateMutateHandler(props) {
		const mutateResult = await onMutate?.(props)

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
			...mutateResult,
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
	onSettled?: UpdateMutationOptions<TData, TError, TParams>['onSettled'],
): NonNullable<UpdateMutationOptions<TData, TError, TParams>['onSettled']> {
	return async function updateSettledHandler(
		data,
		error,
		props,
		context,
	) {
		await onSettled?.(data, error, props, context)

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
	onError?: UpdateMutationOptions<TData, TError, TParams>['onError'],
): NonNullable<UpdateMutationOptions<TData, TError, TParams>['onError']> {
	return async function updateErrorHandler(
		error,
		variables,
		context,
	) {
		if (context) {
			for (const query of context.previousQueries)
				queryClient.setQueryData(query[0], query[1])
		}

		await onError?.(error, variables, context)
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
