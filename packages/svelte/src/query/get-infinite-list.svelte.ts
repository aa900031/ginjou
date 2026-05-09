import type { BaseRecord, GetInfiniteListResult } from '@ginjou/core'
import type { CreateInfiniteQueryResult, InfiniteData } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { createSubscribeCallback, GetInfiniteList, GetList, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { createInfiniteQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { extract, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetInfiniteListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = MaybeAccessor<GetInfiniteList.Props<TData, TError, TResultData, TPageParam>>

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
	CreateInfiniteQueryResult<
		InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>,
		TError
	> & {
		readonly records: TResultData[][] | undefined
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
	const notify = useNotify(context)
	const translate = useTranslate(context)

	const resolvedProps = $derived(extract(props))
	const realtimeOptions = useRealtimeOptions(() => resolvedProps.realtime, context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = $derived.by(() => GetInfiniteList.resolveQueryProps<TPageParam>({
		fetcherName: extract(resolvedProps.fetcherName),
		resource: extract(resolvedProps.resource),
		pagination: extract(resolvedProps.pagination),
		sorters: extract(resolvedProps.sorters),
		filters: extract(resolvedProps.filters),
		meta: extract(resolvedProps.meta),
	}))
	const queryKey = $derived.by(() => GetList.createQueryKey<TPageParam>({
		props: queryProps,
	}))
	const initialPageParam = $derived.by(() => GetInfiniteList.getInitialPageParam({
		props: queryProps,
	}))
	const enabledFn = GetInfiniteList.createQueryEnabledFn({
		getEnabled: () => resolvedProps.queryOptions?.enabled,
		getQueryKey: () => queryKey,
		getResource: () => queryProps.resource,
		getQueryOptions: () => resolvedProps.queryOptions,
		queryClient,
	})
	const queryFn = GetInfiniteList.createQueryFn<TData, TPageParam>({
		getProps,
		queryClient,
		fetchers,
	})
	const handleSuccess = GetInfiniteList.createSuccessHandler<TData, TResultData, TPageParam>({
		notify,
		getProps,
		getSuccessNotify: () => resolvedProps.successNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onSuccess?.(...args),
	})
	const handleError = GetInfiniteList.createErrorHandler<TError, TPageParam>({
		notify,
		translate,
		checkError,
		getProps,
		getErrorNotify: () => resolvedProps.errorNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onError?.(...args),
	})
	const placeholderData = GetInfiniteList.createPlacholerDataFn<TData, TError, TPageParam>()
	const getNextPageParam = GetInfiniteList.createGetNextPageParamFn<TData, TPageParam>()
	const getPreviousPageParam = GetInfiniteList.createGetPreviousPageParamFn<TData, TPageParam>()

	const query = createInfiniteQuery<GetInfiniteListResult<TData, TPageParam>, TError, InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>, any, TPageParam>(
		() => ({
			initialPageParam,
			getNextPageParam,
			getPreviousPageParam,
			...resolvedProps.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData,
		}),
		() => queryClient,
	)

	const records = $derived.by(() => GetInfiniteList.getRecords({
		data: query.data,
	}))

	useQueryCallbacks<InfiniteData<GetInfiniteListResult<TResultData, TPageParam>, TPageParam>, TError>(() => ({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	}))

	const channel = $derived.by(() => getSubscribeChannel({
		resource: queryProps.resource,
		realtimeOptions: realtimeOptions.value,
	}))
	const params = $derived.by(() => GetList.getSubscribeParams({
		queryProps,
		realtimeOptions: realtimeOptions.value,
	}))
	const callback = createSubscribeCallback({
		queryClient,
		getRealtimeOptions: () => realtimeOptions.value,
		getResource: () => queryProps.resource,
		getFetcherName: () => queryProps.fetcherName,
	})

	useSubscribe(() => ({
		channel,
		params,
		meta: queryProps.meta,
		callback,
		actions: [RealtimeAction.Any],
		enabled: enabledFn,
	}), context)

	return withAccessors(query, {
		records: () => records,
	})

	function getProps(): GetInfiniteList.ResolvedQueryProps<TPageParam> {
		return queryProps
	}
}
