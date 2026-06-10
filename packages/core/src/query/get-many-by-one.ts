import type { QueryClient, QueryObserverOptions, QueryObserverResult, RefetchOptions } from '@tanstack/query-core'
import type { QueryCallbacks } from 'tanstack-query-callbacks'
import type { SetOptional, Simplify } from 'type-fest'
import type { BaseRecord, GetManyProps, GetManyResult, GetOneResult, RecordKey } from './fetcher'
import type { FetcherProps, Fetchers, ResolvedFetcherProps } from './fetchers'
import { GetOne } from '.'
import { resolveFetcherProps } from './fetchers'

export type QueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& QueryObserverOptions<
		GetOneResult<TData>,
		TError,
		GetOneResult<TResultData>,
		GetOneResult<TData>
	>
	& QueryCallbacks<
		GetOneResult<TResultData>,
		TError
	>
>

export type QueryProps = Simplify<
	& SetOptional<
		GetManyProps,
		| 'ids'
		| 'resource'
	>
	& FetcherProps
>

export type ResolvedQueryProps = Simplify<
	& GetManyProps
	& ResolvedFetcherProps
>

export function resolveQueryProps(
	props: QueryProps,
): ResolvedQueryProps {
	return {
		...resolveFetcherProps(props),
		ids: props.ids ?? [],
		resource: props.resource ?? '',
		meta: props.meta,
	}
}

export type QueryOptionsForProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Omit<
	QueryOptions<TData, TError, TResultData>,
	| 'queryFn'
	| 'queryKey'
>

export type GenQueryOptionsForPropsFn<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = (input: GenQueryOptionsForPropsInput) =>
	| QueryOptionsForProps<TData, TError, TResultData>
	| undefined

export interface GenQueryOptionsForPropsInput {
	id: RecordKey
	index: number
}

export type Props<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& QueryProps
	& {
		queryOptions?:
			| QueryOptionsForProps<TData, TError, TResultData>
			| GenQueryOptionsForPropsFn<TData, TError, TResultData>
	}
>

export function getOptionsForQueries<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
>(
	props: {
		queryProps: ResolvedQueryProps
		fetchers: Fetchers
		queryOptions:
			| QueryOptionsForProps<TData, TError, TResultData>
			| GenQueryOptionsForPropsFn<TData, TError, TResultData>
			| undefined
		queryClient: QueryClient
	},
): QueryObserverOptions<GetOneResult<TData>, TError, GetOneResult<TResultData>, GetOneResult<TData>>[] {
	return props.queryProps.ids.map((id, index) => {
		const propsForGetOne = resolveGetOneProps(id, props.queryProps)
		const queryOptionsForProps = resolveQueryOptions({ id, index }, props.queryOptions)
		const queryKey = GetOne.createQueryKey({
			props: propsForGetOne,
		})
		const enabledFn = GetOne.createQueryEnabledFn({
			getEnabled: () => queryOptionsForProps?.enabled,
			getQueryKey: () => queryKey,
			getId: () => id,
			getQueryOptions: () => queryOptionsForProps,
			queryClient: props.queryClient,
		})
		const queryFn = GetOne.createQueryFn<TData>({
			fetchers: props.fetchers,
			getProps: () => propsForGetOne,
		})
		const placeholderDataFn = GetOne.createPlacholerDataFn<TData, TError>()

		return {
			...queryOptionsForProps,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData: placeholderDataFn,
		}
	})
}

export function createCombineFn<
	TResultData extends BaseRecord,
	TError,
>(): (results: QueryObserverResult<GetOneResult<TResultData>, TError>[]) => QueryObserverResult<GetManyResult<TResultData>, TError> {
	return function combine(results) {
		if (results.length === 0) {
			return createSuccessResult<TResultData, TError>({
				data: [],
				dataUpdatedAt: 0,
				results,
			})
		}

		const firstError = results.find(result => result.error != null)
		const isComplete = results.every(result => result.data?.data != null)
		const hasError = firstError != null

		if (!hasError && isComplete) {
			return createSuccessResult<TResultData, TError>({
				data: results.map(result => result.data!.data),
				dataUpdatedAt: getMinUpdatedAt(results.map(result => result.dataUpdatedAt)),
				results,
			})
		}

		if (hasError) {
			return createErrorResult<TResultData, TError>({
				error: firstError.error as TError,
				results,
			})
		}

		return createPendingResult<TResultData, TError>({
			results,
		})
	}
}

interface CreateCombinedResultProps<
	TData extends BaseRecord,
	TError,
> {
	results: QueryObserverResult<GetOneResult<TData>, TError>[]
}

interface CreateSuccessResultProps<
	TData extends BaseRecord,
	TError,
> extends CreateCombinedResultProps<TData, TError> {
	data: TData[]
	dataUpdatedAt: number
}

function createSuccessResult<
	TData extends BaseRecord,
	TError,
>(
	{
		data,
		dataUpdatedAt,
		results,
	}: CreateSuccessResultProps<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	return createCombinedResult<TData, TError>({
		results,
		data: {
			data,
		},
		dataUpdatedAt,
		error: null,
		status: 'success',
		isError: false,
		isPending: false,
		isLoading: false,
		isLoadingError: false,
		isRefetchError: false,
		isSuccess: true,
		isPlaceholderData: results.some(result => result.isPlaceholderData),
	})
}

interface CreateErrorResultProps<
	TData extends BaseRecord,
	TError,
> extends CreateCombinedResultProps<TData, TError> {
	error: TError
}

function createErrorResult<
	TData extends BaseRecord,
	TError,
>(
	{
		error,
		results,
	}: CreateErrorResultProps<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	return createCombinedResult<TData, TError>({
		results,
		data: undefined,
		dataUpdatedAt: 0,
		error,
		status: 'error',
		isError: true,
		isPending: false,
		isLoading: false,
		isLoadingError: !results.some(result => result.isRefetchError),
		isRefetchError: results.some(result => result.isRefetchError),
		isSuccess: false,
		isPlaceholderData: false,
	})
}

function createPendingResult<
	TData extends BaseRecord,
	TError,
>(
	{
		results,
	}: CreateCombinedResultProps<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	return createCombinedResult<TData, TError>({
		results,
		data: undefined,
		dataUpdatedAt: 0,
		error: null,
		status: 'pending',
		isError: false,
		isPending: true,
		isLoading: results.some(result => result.isLoading),
		isLoadingError: false,
		isRefetchError: false,
		isSuccess: false,
		isPlaceholderData: false,
	})
}

interface CreateCombinedResultInput<
	TData extends BaseRecord,
	TError,
> extends CreateCombinedResultProps<TData, TError> {
	data: GetManyResult<TData> | undefined
	dataUpdatedAt: number
	error: TError | null
	status: 'pending' | 'error' | 'success'
	isError: boolean
	isPending: boolean
	isLoading: boolean
	isLoadingError: boolean
	isRefetchError: boolean
	isSuccess: boolean
	isPlaceholderData: boolean
}

function createCombinedResult<
	TData extends BaseRecord,
	TError,
>(
	{
		results,
		data,
		dataUpdatedAt,
		error,
		status,
		isError,
		isPending,
		isLoading,
		isLoadingError,
		isRefetchError,
		isSuccess,
		isPlaceholderData,
	}: CreateCombinedResultInput<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	const isFetching = results.some(result => result.isFetching)
	const isPaused = results.some(result => result.isPaused)
	const fetchStatus = isFetching
		? 'fetching'
		: isPaused
			? 'paused'
			: 'idle'
	const isRefetching = results.some(result => result.isRefetching)
	const errorUpdatedAt = getMaxUpdatedAt(results.map(result => result.errorUpdatedAt))
	const errorUpdateCount = results.reduce((count, result) => count + result.errorUpdateCount, 0)
	const failureCount = results.reduce((count, result) => Math.max(count, result.failureCount), 0)
	let promiseCache: Promise<GetManyResult<TData>> | undefined

	const result = {
		data,
		dataUpdatedAt,
		error,
		errorUpdatedAt,
		failureCount,
		failureReason: error,
		errorUpdateCount,
		isError,
		isFetched: results.every(result => result.isFetched),
		isFetchedAfterMount: results.every(result => result.isFetchedAfterMount),
		isFetching,
		isLoading,
		isPending,
		isLoadingError,
		isInitialLoading: isLoading,
		isPaused,
		isPlaceholderData,
		isRefetchError,
		isRefetching,
		isStale: results.some(result => result.isStale),
		isSuccess,
		isEnabled: results.some(result => result.isEnabled),
		refetch: (options?: RefetchOptions) => Promise.all(
			results.map(result => result.refetch(options)),
		).then(refetchedResults => createCombineFn<TData, TError>()(
			refetchedResults as QueryObserverResult<GetOneResult<TData>, TError>[],
		)),
		status,
		fetchStatus,
	} as QueryObserverResult<GetManyResult<TData>, TError>

	Object.defineProperty(result, 'promise', {
		configurable: true,
		enumerable: false,
		get() {
			promiseCache ??= Promise.all(results.map(result => result.promise)).then(items => ({
				data: items.map(item => item.data),
			}))
			return promiseCache
		},
	})

	return result
}

function getMinUpdatedAt(
	values: number[],
): number {
	return values.reduce((minValue, value) => {
		if (value === 0)
			return minValue
		if (minValue === 0)
			return value
		return Math.min(minValue, value)
	}, 0)
}

function getMaxUpdatedAt(
	values: number[],
): number {
	return values.reduce((maxValue, value) => Math.max(maxValue, value), 0)
}

function resolveQueryOptions<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
>(
	input: GenQueryOptionsForPropsInput,
	queryOptions:
		| QueryOptionsForProps<TData, TError, TResultData>
		| GenQueryOptionsForPropsFn<TData, TError, TResultData>
		| undefined,
): QueryOptionsForProps<TData, TError, TResultData> | undefined {
	if (typeof queryOptions === 'function')
		return queryOptions(input)
	return queryOptions
}

function resolveGetOneProps(
	id: RecordKey,
	queryProps: ResolvedQueryProps,
): GetOne.ResolvedQueryProps {
	const { ids, ...rest } = queryProps
	return {
		id,
		...rest,
	}
}
