import type { BaseRecord, CustomResult } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { ToMaybeReadables } from '../utils/store'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Custom, RealtimeAction } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { derived } from 'svelte/store'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useSubscribe } from '../realtime'
import { createExecableFn, toGetter, toReadable } from '../utils/store'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCustomProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TQuery,
	TPayload,
> = ToMaybeReadables<
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
> = CreateQueryResult<CustomResult<TResultData>, TError>

export function useCustom<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
	TQuery = unknown,
	TPayload = unknown,
>(
	props: UseCustomProps<TData, TError, TResultData, TQuery, TPayload>,
	context?: UseCustomContext,
): UseCustomResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const checkError = useCheckError(context)

	const queryProps = derived([
		toReadable(props.url),
		toReadable(props.method),
		toReadable(props.sorters),
		toReadable(props.filters),
		toReadable(props.payload),
		toReadable(props.query),
		toReadable(props.headers),
		toReadable(props.meta),
		toReadable(props.fetcherName),
	] as const, ([
		url,
		method,
		sorters,
		filters,
		payload,
		query,
		headers,
		meta,
		fetcherName,
	]) => Custom.resolveQueryProps<TQuery, TPayload>({
		url,
		method,
		sorters,
		filters,
		payload,
		query,
		headers,
		meta,
		fetcherName,
	}))
	const queryKey = derived([
		queryProps,
	] as const, ([
		$queryProps,
	]) => Custom.createQueryKey({
		props: $queryProps,
	}))
	const queryFn = Custom.createQueryFn<TData, TResultData, TError, TQuery, TPayload>({
		fetchers,
		getProps: toGetter(queryProps),
	})
	const handleSuccess = Custom.createSuccessHandler<TData, TResultData, TQuery, TPayload>({
		notify,
		getProps: toGetter(queryProps),
		getSuccessNotify: toGetter(props.successNotify),
		emitParent: () => {
			// FIXME:
			throw new Error('No Impleation')
		},
	})
	const handleError = Custom.createErrorHandler<TError, TQuery, TPayload>({
		notify,
		translate,
		checkError: createExecableFn(checkError, 'mutateAsync'),
		getProps: toGetter(queryProps),
		getErrorNotify: toGetter(props.errorNotify),
		emitParent: () => {
			// FIXME:
			throw new Error('No Impleation')
		},
	})

	const query = createQuery<CustomResult<TData>, TError, CustomResult<TResultData>>(
		derived([
			toReadable(props.queryOptions),
		] as const, ([
			$queryOptions,
		]) => ({
			queryKey,
			queryFn,
			...$queryOptions,
			onSuccess: handleSuccess,
			onError: handleError,
		})),
		queryClient,
	)

	useSubscribe({
		channel: derived(toReadable(props.realtime), realtime => realtime?.channel ?? ''),
		params: derived(toReadable(props.realtime), realtime => realtime?.params),
		meta: derived(queryProps, props => props.meta),
		callback: createExecableFn(toReadable(props.realtime), 'callback'),
		enabled: derived(toReadable(props.realtime), realtime => realtime?.channel != null),
		actions: [RealtimeAction.Any],
	}, context)

	return query
}
