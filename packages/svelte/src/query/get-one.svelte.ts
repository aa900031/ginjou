import type { BaseRecord, GetOneResult } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { createSubscribeCallback, GetOne, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { extract, unbox, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetOneProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = MaybeAccessor<
	GetOne.Props<TData, TError, TResultData>
>

export type UseGetOneContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseGetOneResult<
	TError,
	TResultData extends BaseRecord,
> = Simplify<
	& CreateQueryResult<GetOneResult<TResultData>, TError>
	& {
		readonly record: TResultData | undefined
	}
>

export function useGetOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetOneProps<TData, TError, TResultData>,
	context?: UseGetOneContext,
): UseGetOneResult<TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const resolvedProps = $derived(extract(props))
	const realtimeOptions = useRealtimeOptions(() => resolvedProps.realtime, context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = $derived.by(() => GetOne.resolveQueryProps({
		id: extract(resolvedProps.id),
		resource: extract(resolvedProps.resource),
		meta: extract(resolvedProps.meta),
		fetcherName: extract(resolvedProps.fetcherName),
	}))
	const queryKey = $derived.by(() => GetOne.createQueryKey({
		props: queryProps,
	}))
	const enabledFn = GetOne.createQueryEnabledFn({
		getEnabled: () => resolvedProps.queryOptions?.enabled,
		getQueryKey: () => queryKey,
		getId: () => queryProps.id,
		getQueryOptions: () => resolvedProps.queryOptions,
		queryClient,
	})
	const queryFn = GetOne.createQueryFn<TData>({
		fetchers,
		getProps,
	})
	const handleSuccess = GetOne.createSuccessHandler<TData, TResultData>({
		notify,
		getProps,
		getSuccessNotify: () => resolvedProps.successNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onSuccess?.(...args),
	})
	const handleError = GetOne.createErrorHandler<TError>({
		notify,
		translate,
		checkError,
		getProps,
		getErrorNotify: () => resolvedProps.errorNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onError?.(...args),
	})
	const placeholderData = GetOne.createPlacholerDataFn<TData, TError>()

	const query = createQuery<GetOneResult<TData>, TError, GetOneResult<TResultData>>(
		() => ({
			...resolvedProps.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData,
		}),
		() => queryClient,
	)

	useQueryCallbacks<GetOneResult<TResultData>, TError>(() => ({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	}))

	const channel = $derived.by(() => getSubscribeChannel({
		resource: queryProps.resource,
		realtimeOptions: unbox(realtimeOptions),
	}))
	const params = $derived.by(() => GetOne.getSubscribeParams({
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
		actions: [RealtimeAction.Any],
		meta: queryProps.meta,
		enabled: enabledFn,
	}), context)

	return withAccessors(query, {
		record: () => query.data?.data,
	})

	function getProps(): GetOne.ResolvedQueryProps {
		return queryProps
	}
}
