import type { ToMaybeRefs } from '@bouzu/vue-helper'
import type { BaseRecord, GetManyResult, GetOneResult } from '@ginjou/core'
import type { QueryObserverResult, UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { GetManyByOne } from '@ginjou/core'
import { useQueries } from '@tanstack/vue-query'
import { computed, toRef, unref } from 'vue-demi'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetManyByOneProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = ToMaybeRefs<
	GetManyByOne.Props<TData, TError, TResultData>
>

export type UseGetManyByOneContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseGetManyByOneResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseQueryReturnType<GetManyResult<TResultData>, TError>
	& {
		records: Ref<TResultData[] | undefined>
	}
>

export function useGetManyByOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetManyByOneProps<TData, TError, TResultData>,
	context?: UseGetManyByOneContext,
): UseGetManyByOneResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const queryProps = computed(() => GetManyByOne.resolveQueryProps({
		ids: unref(props.ids),
		resource: unref(props.resource),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
	}))
	const options = computed(() => {
		const queryOptions = unref(props.queryOptions)
		return GetManyByOne.getOptionsForQueries<TData, TError, TResultData>({
			queryProps: unref(queryProps),
			fetchers,
			queryOptions,
			queryClient,
		}).map((queryOption) => {
			const enabled = queryOption.enabled
			return {
				...queryOption,
				enabled: enabled == null ? undefined : () => enabled,
			}
		})
	})
	const combineFn = GetManyByOne.createCombineFn<TResultData, TError>()

	const queries = useQueries<
		{
			queryFnData: GetOneResult<TData>
			error: TError
			data: GetOneResult<TResultData>
		}[],
		QueryObserverResult<GetManyResult<TResultData>, TError>
	>(
		{
			// FIXME: vue-query's useQueries types do not model this normalized
			// zero-arg enabled getter shape cleanly under generics.
			queries: options as any,
			combine: combineFn,
			shallow: true,
		},
		queryClient,
	)

	const query = {
		data: toRef(() => unref(queries).data),
		dataUpdatedAt: toRef(() => unref(queries).dataUpdatedAt),
		error: toRef(() => unref(queries).error),
		errorUpdatedAt: toRef(() => unref(queries).errorUpdatedAt),
		failureCount: toRef(() => unref(queries).failureCount),
		failureReason: toRef(() => unref(queries).failureReason),
		errorUpdateCount: toRef(() => unref(queries).errorUpdateCount),
		isError: toRef(() => unref(queries).isError),
		isFetched: toRef(() => unref(queries).isFetched),
		isFetchedAfterMount: toRef(() => unref(queries).isFetchedAfterMount),
		isFetching: toRef(() => unref(queries).isFetching),
		isLoading: toRef(() => unref(queries).isLoading),
		isPending: toRef(() => unref(queries).isPending),
		isLoadingError: toRef(() => unref(queries).isLoadingError),
		isInitialLoading: toRef(() => unref(queries).isInitialLoading),
		isPaused: toRef(() => unref(queries).isPaused),
		isPlaceholderData: toRef(() => unref(queries).isPlaceholderData),
		isRefetchError: toRef(() => unref(queries).isRefetchError),
		isRefetching: toRef(() => unref(queries).isRefetching),
		isStale: toRef(() => unref(queries).isStale),
		isSuccess: toRef(() => unref(queries).isSuccess),
		isEnabled: toRef(() => unref(queries).isEnabled),
		status: toRef(() => unref(queries).status),
		fetchStatus: toRef(() => unref(queries).fetchStatus),
		promise: toRef(() => unref(queries).promise),
		suspense: async () => {
			await unref(queries).promise
			return unref(queries) as QueryObserverResult<GetManyResult<TResultData>, TError>
		},
		refetch: opts => unref(queries).refetch(opts),
	} as UseQueryReturnType<GetManyResult<TResultData>, TError>

	return {
		...query,
		records: toRef(() => unref(queries).data?.data),
	} as UseGetManyByOneResult<TData, TError, TResultData>
}
