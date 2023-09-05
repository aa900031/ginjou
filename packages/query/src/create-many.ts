import type { MutationFunction, QueryClient } from '@tanstack/query-core'
import { InvalidateTarget, type InvalidateTargetType, triggerInvalidates } from './invalidate'
import { fakeMany } from './helper'
import { genGetOneQueryKey } from './get-one'
import type { SuccessHandler } from './types'
import type { BaseRecord, CreateManyProps, CreateManyResult } from './fetcher'
import type { Fetchers } from './fetchers'
import { getFetcher } from './fetchers'

const DEFAULT_CREATE_MANY_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
]

export type CreateManyMutationProps<
	TParams = Record<string, any>,
> =
	& CreateManyProps<TParams>
	& {
		fetcherName?: string
		invalidates?: InvalidateTargetType[]
	}

export function createCreateManyMutationFn<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	fetchers: Fetchers,
): MutationFunction<CreateManyResult<TData>, CreateManyMutationProps<TParams>> {
	return async function createMutationFn(props) {
		const fetcher = getFetcher(props, fetchers)
		const result = typeof fetcher.createMany === 'function'
			? await fetcher.createMany<TData, TParams>(props)
			: await fakeMany(props.params.map(val => fetcher.create<TData, TParams>({ ...props, params: val })))

		updateCache<TData, TParams>(queryClient, props, result)

		return result
	}
}

export function createCreateManySuccessHandler<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
): SuccessHandler<CreateManyResult<TData>, CreateManyMutationProps<TParams>> {
	return async function createSuccessHandler(
		_data,
		props,
	) {
		triggerInvalidates({
			...props,
			invalidates: props.invalidates ?? DEFAULT_CREATE_MANY_INVALIDATES,
		}, queryClient)
	}
}

function updateCache<
	TData extends BaseRecord = BaseRecord,
	TParams = Record<string, any>,
>(
	queryClient: QueryClient,
	props: CreateManyMutationProps<TParams>,
	result: CreateManyResult<TData>,
): void {
	for (const record of result.data) {
		queryClient.setQueryData(
			genGetOneQueryKey({ ...props, id: record.id! }),
			(old: TData | undefined) => old ?? record,
		)
	}
}
