import type { BaseRecord, GetInfiniteListResult } from '@ginjou/core'
import type { InfiniteData, UseInfiniteQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { createSubscribeCallback, GetInfiniteList, GetList, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { useInfiniteQuery } from '@tanstack/vue-query'
import { toRef } from '@vueuse/shared'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetInfiniteListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = ToMaybeRefs<
	GetInfiniteList.Props<TData, TError, TResultData, TPageParam>
>

export type UseGetInfiniteListContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseGetInfiniteListResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& UseInfiniteQueryReturnType<
		InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>,
		TError
	>
	& {
		records: Ref<TResultData[][] | undefined>
	}
>

export function useGetInfiniteList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props: UseGetInfiniteListProps<TData, TError, TResultData, TPageParam>,
	context?: UseGetInfiniteListContext,
): UseGetInfiniteListResult<TError, TResultData, TPageParam> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const realtimeOptions = useRealtimeOptions(toRef(() => unref(props.realtime)), context)
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = computed(() => GetInfiniteList.resolveQueryProps<TPageParam>({
		fetcherName: unref(props.fetcherName),
		resource: unref(props.resource),
		pagination: unref(props.pagination),
		sorters: unref(props.sorters),
		filters: unref(props.filters),
		meta: unref(props.meta),
	}))
	const queryKey = computed(() => GetList.createQueryKey<TPageParam>({
		props: unref(queryProps),
	}))
	const enabledFn = GetList.createQueryEnabledFn({
		getEnabled: () => unref(props.queryOptions)?.enabled,
		getQueryKey: () => unref(queryKey),
		getResource: () => unref(queryProps).resource,
		queryClient,
	})
	const queryFn = GetInfiniteList.createQueryFn<TData, TError, TResultData, TPageParam>({
		getProps: () => unref(queryProps),
		queryClient,
		fetchers,
	})
	const handleSuccess = GetInfiniteList.createSuccessHandler<TData, TResultData, TPageParam>({
		notify,
		getProps: () => unref(queryProps),
		getSuccessNotify: () => unref(props.successNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onSuccess?.(...args),
	})
	const handleError = GetInfiniteList.createErrorHandler<TError, TPageParam>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onError?.(...args),
	})
	const placeholderData = GetInfiniteList.createPlacholerDataFn<TData, TError, TResultData>()

	const query = useInfiniteQuery<GetInfiniteListResult<TData, TPageParam>, TError, InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>, any, TPageParam>(
		computed(() => ({
			initialPageParam: GetInfiniteList.getInitialPageParam({
				props: unref(queryProps),
			}),
			getNextPageParam: GetInfiniteList.getNextPageParam,
			getPreviousPageParam: GetInfiniteList.getPreviousPageParam,
			// FIXME: type
			...unref(props.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData,
		})),
		queryClient,
	)

	const records = computed(() => GetInfiniteList.getRecords({
		data: unref(query.data),
	}))

	useQueryCallbacks<InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>, TError>({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	})

	useSubscribe({
		channel: computed(() => getSubscribeChannel({
			resource: unref(queryProps).resource,
			realtimeOptions: unref(realtimeOptions),
		})),
		params: computed(() => GetList.getSubscribeParams({
			queryProps: unref(queryProps),
			realtimeOptions: unref(realtimeOptions),
		})),
		meta: toRef(() => unref(queryProps).meta),
		callback: createSubscribeCallback({
			queryClient,
			getRealtimeOptions: () => unref(realtimeOptions),
			getResource: () => unref(queryProps).resource,
			getFetcherName: () => unref(queryProps).fetcherName,
		}),
		actions: [RealtimeAction.Any],
		enabled: enabledFn,
	}, context)

	return {
		...query,
		records,
	}
}
