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

export function getQueriesOptions<
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
	return combineResults
}

interface CreateCombinedResultProps<
	TData extends BaseRecord,
	TError,
> {
	results: QueryObserverResult<GetOneResult<TData>, TError>[]
	state: CombinedResultState<TData, TError>
}

interface CreateSuccessResultProps<
	TData extends BaseRecord,
	TError,
> extends CreateCombinedResultProps<TData, TError> {
	data: TData[]
	dataUpdatedAt: number
}

interface CombinedResultState<
	TData extends BaseRecord,
	TError,
> {
	data: TData[]
	dataUpdatedAt: number
	firstError: TError | null
	isComplete: boolean
	isFetching: boolean
	isPaused: boolean
	isRefetching: boolean
	errorUpdatedAt: number
	errorUpdateCount: number
	failureCount: number
	isFetched: boolean
	isFetchedAfterMount: boolean
	isStale: boolean
	isEnabled: boolean
	isLoading: boolean
	hasRefetchError: boolean
	hasPlaceholderData: boolean
}

function createSuccessResult<
	TData extends BaseRecord,
	TError,
>(
	{
		data,
		dataUpdatedAt,
		results,
		state,
	}: CreateSuccessResultProps<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	return createCombinedResult<TData, TError>({
		results,
		state,
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
		isPlaceholderData: state.hasPlaceholderData,
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
		state,
	}: CreateErrorResultProps<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	return createCombinedResult<TData, TError>({
		results,
		state,
		data: undefined,
		dataUpdatedAt: 0,
		error,
		status: 'error',
		isError: true,
		isPending: false,
		isLoading: false,
		isLoadingError: !state.hasRefetchError,
		isRefetchError: state.hasRefetchError,
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
		state,
	}: CreateCombinedResultProps<TData, TError>,
): QueryObserverResult<GetManyResult<TData>, TError> {
	return createCombinedResult<TData, TError>({
		results,
		state,
		data: undefined,
		dataUpdatedAt: 0,
		error: null,
		status: 'pending',
		isError: false,
		isPending: true,
		isLoading: state.isLoading,
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
		state,
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
	const isFetching = state.isFetching
	const isPaused = state.isPaused
	const fetchStatus = isFetching
		? 'fetching'
		: isPaused
			? 'paused'
			: 'idle'
	const isRefetching = state.isRefetching
	const errorUpdatedAt = state.errorUpdatedAt
	const errorUpdateCount = state.errorUpdateCount
	const failureCount = state.failureCount
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
		isFetched: state.isFetched,
		isFetchedAfterMount: state.isFetchedAfterMount,
		isFetching,
		isLoading,
		isPending,
		isLoadingError,
		isInitialLoading: isLoading,
		isPaused,
		isPlaceholderData,
		isRefetchError,
		isRefetching,
		isStale: state.isStale,
		isSuccess,
		isEnabled: state.isEnabled,
		status,
		fetchStatus,
		refetch: (options?: RefetchOptions) => Promise.all(
			results.map(result => result.refetch(options)),
		).then(refetchedResults => combineResults<TData, TError>(refetchedResults)),
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

function combineResults<
	TData extends BaseRecord,
	TError,
>(
	results: QueryObserverResult<GetOneResult<TData>, TError>[],
): QueryObserverResult<GetManyResult<TData>, TError> {
	const state = collectCombinedResultState(results)

	if (state.firstError == null && state.isComplete) {
		return createSuccessResult<TData, TError>({
			data: state.data,
			dataUpdatedAt: state.dataUpdatedAt,
			results,
			state,
		})
	}

	if (state.firstError != null) {
		return createErrorResult<TData, TError>({
			error: state.firstError,
			results,
			state,
		})
	}

	return createPendingResult<TData, TError>({
		results,
		state,
	})
}

function collectCombinedResultState<
	TData extends BaseRecord,
	TError,
>(
	results: QueryObserverResult<GetOneResult<TData>, TError>[],
): CombinedResultState<TData, TError> {
	// eslint-disable-next-line unicorn/no-new-array
	const data = new Array<TData>(results.length)
	let dataUpdatedAt = 0
	let firstError: TError | null = null
	let isComplete = true
	let isFetching = false
	let isPaused = false
	let isRefetching = false
	let errorUpdatedAt = 0
	let errorUpdateCount = 0
	let failureCount = 0
	let isFetched = true
	let isFetchedAfterMount = true
	let isStale = false
	let isEnabled = false
	let isLoading = false
	let hasRefetchError = false
	let hasPlaceholderData = false

	for (let index = 0; index < results.length; index++) {
		const result = results[index]!
		const record = result.data?.data
		if (record == null) {
			isComplete = false
		}
		else {
			data[index] = record
			dataUpdatedAt = updateMinUpdatedAt(dataUpdatedAt, result.dataUpdatedAt)
		}

		if (firstError == null && result.error != null)
			firstError = result.error as TError
		if (result.isFetching)
			isFetching = true
		if (result.isPaused)
			isPaused = true
		if (result.isRefetching)
			isRefetching = true
		if (result.errorUpdatedAt > errorUpdatedAt)
			errorUpdatedAt = result.errorUpdatedAt
		errorUpdateCount += result.errorUpdateCount
		failureCount = Math.max(failureCount, result.failureCount)
		if (!result.isFetched)
			isFetched = false
		if (!result.isFetchedAfterMount)
			isFetchedAfterMount = false
		if (result.isStale)
			isStale = true
		if (result.isEnabled)
			isEnabled = true
		if (result.isLoading)
			isLoading = true
		if (result.isRefetchError)
			hasRefetchError = true
		if (result.isPlaceholderData)
			hasPlaceholderData = true
	}

	return {
		data,
		dataUpdatedAt,
		firstError,
		isComplete,
		isFetching,
		isPaused,
		isRefetching,
		errorUpdatedAt,
		errorUpdateCount,
		failureCount,
		isFetched,
		isFetchedAfterMount,
		isStale,
		isEnabled,
		isLoading,
		hasRefetchError,
		hasPlaceholderData,
	}
}

function updateMinUpdatedAt(
	currentMin: number,
	value: number,
): number {
	if (value === 0)
		return currentMin
	if (currentMin === 0)
		return value
	return Math.min(currentMin, value)
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
