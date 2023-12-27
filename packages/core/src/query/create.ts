import type { MutateFunction, MutationOptions, QueryClient } from '@tanstack/query-core'
import type { Simplify } from 'type-fest'
import { genGetOneQueryKey } from './get-one'
import { InvalidateTarget, type InvalidateTargetType, triggerInvalidates } from './invalidate'
import type { BaseRecord, CreateProps, CreateResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_CREATE_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

export type CreateMutationProps<
	TParams = Record<string, any>,
> = Simplify<
	& CreateProps<TParams>
	& {
		fetcherName?: string
		invalidates?: InvalidateTargetType[]
	}
>

export type CreateMutateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
> = MutateFunction<
	CreateResult<TData>,
	TError,
	CreateMutationProps<TParams>
>

export type CreateMutationOptions<
	TData extends BaseRecord,
	TError,
	TParams,
> = MutationOptions<
	CreateResult<TData>,
	TError,
	CreateMutationProps<TParams>
>

export function createCreateMutationFn<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	fetchers: Fetchers,
): NonNullable<CreateMutationOptions<TData, unknown, TParams>['mutationFn']> {
	return async function createMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)
		const result = await fetcher.create<TData, TParams>(props)
		updateCache(queryClient, props, result)

		return result
	}
}

export function createCreateSuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	onSuccess?: CreateMutationOptions<TData, unknown, TParams>['onSuccess'],
): NonNullable<CreateMutationOptions<TData, unknown, TParams>['onSuccess']> {
	return async function handleCreateSuccess(data, props, context) {
		await onSuccess?.(data, props, context)

		await triggerInvalidates({
			...props,
			invalidates: props.invalidates ?? DEFAULT_CREATE_INVALIDATES,
		}, queryClient)
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	props: CreateMutationProps<TParams>,
	result: CreateResult<TData>,
) {
	if (result.data.id == null)
		return

	queryClient.setQueryData(
		genGetOneQueryKey({ ...props, id: result.data.id }),
		result,
	)
}
