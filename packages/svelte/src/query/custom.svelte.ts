import type { BaseRecord, CustomResult, Params } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Custom, RealtimeAction } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useSubscribe } from '../realtime'
import { extract, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCustomProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TQuery extends Params,
	TPayload extends Params,
> = MaybeAccessor<
	Custom.Props<TData, TError, TResultData, TQuery, TPayload>
>

export type UseCustomContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UseSubscribeContext
>

export type UseCustomResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& CreateQueryResult<CustomResult<TResultData>, TError>
	& {
		readonly record: TResultData | undefined
	}
>

export function useCustom<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TQuery extends Params = Params,
	TPayload extends Params = Params,
>(
	props: UseCustomProps<TData, TError, TResultData, TQuery, TPayload>,
	context?: UseCustomContext,
): UseCustomResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const resolvedProps = $derived(extract(props))
	const queryProps = $derived.by(() => Custom.resolveQueryProps<TQuery, TPayload>({
		url: extract(resolvedProps.url),
		method: extract(resolvedProps.method),
		sorters: extract(resolvedProps.sorters),
		filters: extract(resolvedProps.filters),
		payload: extract(resolvedProps.payload),
		query: extract(resolvedProps.query),
		headers: extract(resolvedProps.headers),
		meta: extract(resolvedProps.meta),
		fetcherName: extract(resolvedProps.fetcherName),
	}))
	const queryKey = $derived.by(() => Custom.createQueryKey({
		props: queryProps,
	}))
	const queryFn = Custom.createQueryFn<TData, TResultData, TError, TQuery, TPayload>({
		fetchers,
		getProps: () => queryProps,
	})
	const enabledFn = $derived.by(() => {
		const queryOptions = resolvedProps.queryOptions
		return Custom.createQueryEnabledFn<TData, TError, TResultData>({
			getQueryKey: () => queryKey,
			getEnabled: () => queryOptions?.enabled,
			getQueryOptions: () => queryOptions,
			queryClient,
		})
	})
	const handleSuccess = Custom.createSuccessHandler<TData, TResultData, TQuery, TPayload>({
		notify,
		getProps: () => queryProps,
		getSuccessNotify: () => resolvedProps.successNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onSuccess?.(...args),
	})
	const handleError = Custom.createErrorHandler<TError, TQuery, TPayload>({
		notify,
		translate,
		checkError,
		getProps: () => queryProps,
		getErrorNotify: () => resolvedProps.errorNotify,
		emitParent: (...args) => resolvedProps.queryOptions?.onError?.(...args),
	})

	const query = createQuery<CustomResult<TData>, TError, CustomResult<TResultData>>(
		() => ({
			...resolvedProps.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
		}),
		() => queryClient,
	)

	useQueryCallbacks<CustomResult<TResultData>, TError>(() => ({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	}))

	const subscribeEnabledFn = (): boolean =>
		resolvedProps.realtime?.channel != null

	useSubscribe(() => ({
		channel: resolvedProps.realtime?.channel ?? '',
		params: resolvedProps.realtime?.params,
		meta: queryProps.meta,
		callback: resolvedProps.realtime?.callback,
		enabled: subscribeEnabledFn,
		actions: [RealtimeAction.Any],
	}), context)

	return withAccessors(query, {
		record: () => query.data?.data,
	}) as UseCustomResult<TData, TError, TResultData>
}
