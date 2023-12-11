import type { MutateFunction, MutationFunction, QueryClient } from '@tanstack/query-core'
import { genGetOneQueryKey } from './get-one'
import { InvalidateTarget, type InvalidateTargetType, triggerInvalidates } from './invalidate'
import type { SuccessHandler } from './types'
import type { BaseRecord, CreateProps, CreateResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_CREATE_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

export type CreateMutationProps<
	TParams = Record<string, any>,
> =
	& CreateProps<TParams>
	& {
		fetcherName?: string
		invalidates?: InvalidateTargetType[]
	}

export type CreateMutateFn<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams = Record<string, any>,
> = MutateFunction<
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
): MutationFunction<CreateResult<TData>, CreateMutationProps<TParams>> {
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
): SuccessHandler<CreateResult<TData>, CreateMutationProps<TParams>> {
	return async function createSuccessHandler(
		_data,
		props,
	) {
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
