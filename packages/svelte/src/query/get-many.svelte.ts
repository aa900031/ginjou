import type { BaseRecord, GetManyResult } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { createSubscribeCallback, GetMany, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { extract, unbox, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = MaybeAccessor<
	GetMany.Props<TData, TError, TResultData>
>

export type UseGetManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseGetManyResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& CreateQueryResult<GetManyResult<TResultData>, TError>
	& {
		readonly records: TResultData[] | undefined
	}
>

export function useGetMany<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetManyProps<TData, TError, TResultData>,
	context?: UseGetManyContext,
): UseGetManyResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)

	const resolvedProps = $derived(extract(props))
	const realtimeOptions = useRealtimeOptions(() => resolvedProps.realtime, context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = $derived.by(() => GetMany.resolveQueryProps({
		ids: extract(resolvedProps.ids),
		resource: extract(resolvedProps.resource),
		meta: extract(resolvedProps.meta),
		fetcherName: extract(resolvedProps.fetcherName),
		aggregate: extract(resolvedProps.aggregate),
	}))
	const queryKey = $derived.by(() => GetMany.createQueryKey({ props: queryProps }))
	const enabledFn = $derived.by(() => {
		const queryOptions = resolvedProps.queryOptions
		return GetMany.createQueryEnabledFn({
			getEnabled: () => queryOptions?.enabled,
			getQueryKey: () => queryKey,
			getIds: () => queryProps.ids,
			getResource: () => queryProps.resource,
			getQueryOptions: () => queryOptions,
			queryClient,
		})
	})
	const queryFn = GetMany.createQueryFn<TData, TResultData, TError>({
		fetchers,
		queryClient,
		getProps,
	})
	const placeholderData = GetMany.createPlacholerDataFn<TData, TError, TResultData>({
		getProps,
		queryClient,
	})
	const handleSuccess = GetMany.createSuccessHandler<TData, TResultData>({
		getProps,
		notify,
		getSuccessNotify: () => resolvedProps.successNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onSuccess?.(...args),
	})
	const handleError = GetMany.createErrorHandler<TError>({
		notify,
		translate,
		checkError,
		getProps,
		getErrorNotify: () => resolvedProps.errorNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onError?.(...args),
	})

	const query = createQuery<GetManyResult<TData>, TError, GetManyResult<TResultData>>(
		() => ({
			...resolvedProps.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData,
		}),
		() => queryClient,
	)

	useQueryCallbacks<GetManyResult<TResultData>, TError>(() => ({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	}))

	const channel = $derived.by(() => getSubscribeChannel({
		resource: queryProps.resource,
		realtimeOptions: unbox(realtimeOptions),
	}))
	const params = $derived.by(() => GetMany.getSubscribeParams({
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
		callback,
		meta: queryProps.meta,
		actions: [RealtimeAction.Any],
		enabled: enabledFn,
	}), context)

	return withAccessors(query, {
		records: () => query.data?.data,
	}) as UseGetManyResult<TData, TError, TResultData>

	function getProps(): GetMany.ResolvedQueryProps {
		return queryProps
	}
}
