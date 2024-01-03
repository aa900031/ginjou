import type { Simplify } from 'type-fest'
import type { MutationObserverOptions, QueryClient, QueryKey } from '@tanstack/query-core'
import type { InvalidateTargetType, InvalidatesProps } from '../query/invalidate'
import { InvalidateTarget } from '../query/invalidate'
import type { BaseRecord, UpdateProps, UpdateResult } from '../query/fetcher'
import { type Fetchers, getFetcher } from '../query/fetchers'
import type { QueryPair } from '../query/types'
import type { FetcherProps } from './fetchers'
import type { NotifyProps } from './notify'

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

export interface CreateMutationHandlerProps {
	queryClient: QueryClient
}

export function createMutateHandler<
	TData extends BaseRecord,
	TParams,
>(
	{
		queryClient,
	}: CreateMutationHandlerProps,
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

		// TODO: updateCache

		return {
			previousQueries,
		}
	}
}

// TODO: onSettled

// TODO: onSuccess

// TODO: onError

const DEFAULT_UPDATE_INVALIDATES: InvalidateTargetType[] = [
	InvalidateTarget.List,
	InvalidateTarget.Many,
	InvalidateTarget.One,
]
