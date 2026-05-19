import type { BaseRecord, GetListResult } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { createSubscribeCallback, GetList, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { extract, unbox, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = MaybeAccessor<
	GetList.Props<TData, TError, TResultData, TPageParam>
>

export type UseGetListContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseGetListResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& CreateQueryResult<GetListResult<TResultData, TPageParam>, TError>
	& {
		readonly records: TResultData[] | undefined
	}
>

export function useGetList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TPageParam = number,
>(
	props: UseGetListProps<TData, TError, TResultData, TPageParam>,
	context?: UseGetListContext,
): UseGetListResult<TError, TResultData, TPageParam> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)

	const resolvedProps = $derived(extract(props))
	const realtimeOptions = useRealtimeOptions(() => resolvedProps.realtime, context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = $derived.by(() => GetList.resolveQueryProps<TPageParam>({
		fetcherName: extract(resolvedProps.fetcherName),
		resource: extract(resolvedProps.resource),
		pagination: extract(resolvedProps.pagination),
		sorters: extract(resolvedProps.sorters),
		filters: extract(resolvedProps.filters),
		meta: extract(resolvedProps.meta),
	}))
	const queryKey = $derived.by(() => GetList.createQueryKey<TPageParam>({ props: queryProps }))
	const enabledFn = GetList.createQueryEnabledFn({
		getEnabled: () => resolvedProps.queryOptions?.enabled,
		getQueryKey: () => queryKey,
		getResource: () => queryProps.resource,
		getQueryOptions: () => resolvedProps.queryOptions,
		queryClient,
	})
	const queryFn = GetList.createQueryFn<TData, TResultData, TError, TPageParam>({
		getProps,
		queryClient,
		fetchers,
	})
	const handleSuccess = GetList.createSuccessHandler<TData, TResultData, TPageParam>({
		notify,
		getProps,
		getSuccessNotify: () => resolvedProps.successNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onSuccess?.(...args),
	})
	const handleError = GetList.createErrorHandler<TError, TPageParam>({
		notify,
		translate,
		checkError,
		getProps,
		getErrorNotify: () => resolvedProps.errorNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onError?.(...args),
	})
	const placeholderData = GetList.createPlacholerDataFn<TData, TError, TPageParam>()

	const query = createQuery<GetListResult<TData, TPageParam>, TError, GetListResult<TResultData, TPageParam>>(
		() => ({
			...resolvedProps.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData,
		}),
		() => queryClient,
	)

	useQueryCallbacks<GetListResult<TResultData, TPageParam>, TError>(() => ({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	}))

	const channel = $derived.by(() => getSubscribeChannel({
		resource: queryProps.resource,
		realtimeOptions: unbox(realtimeOptions),
	}))
	const params = $derived.by(() => GetList.getSubscribeParams({
		queryProps,
		realtimeOptions: unbox(realtimeOptions),
	}))
	const callback = createSubscribeCallback({
		queryClient,
		getRealtimeOptions: () => unbox(realtimeOptions),
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
		records: () => query.data?.data,
	})

	function getProps(): GetList.ResolvedQueryProps<TPageParam> {
		return queryProps
	}
}
