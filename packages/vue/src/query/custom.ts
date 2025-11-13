import type { BaseRecord, CustomResult } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseSubscribeContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Custom, RealtimeAction } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { toRef } from '@vueuse/shared'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useSubscribe } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCustomProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TQuery,
	TPayload,
> = ToMaybeRefs<
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
	& UseQueryReturnType<CustomResult<TResultData>, TError>
	& {
		record: Ref<TResultData | undefined>
	}
>

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
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = computed(() => Custom.resolveQueryProps<TQuery, TPayload>({
		url: unref(props.url),
		method: unref(props.method),
		sorters: unref(props.sorters),
		filters: unref(props.filters),
		payload: unref(props.payload),
		query: unref(props.query),
		headers: unref(props.headers),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
	}))
	const queryKey = computed(() => Custom.createQueryKey({
		props: unref(queryProps),
	}))
	const queryFn = Custom.createQueryFn<TData, TResultData, TError, TQuery, TPayload>({
		fetchers,
		getProps: () => unref(queryProps),
	})
	const handleSuccess = Custom.createSuccessHandler<TData, TResultData, TQuery, TPayload>({
		notify,
		getProps: () => unref(queryProps),
		getSuccessNotify: () => unref(props.successNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onSuccess?.(...args),
	})
	const handleError = Custom.createErrorHandler<TError, TQuery, TPayload>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onError?.(...args),
	})

	const query = useQuery<CustomResult<TData>, TError, CustomResult<TResultData>>(
		computed(() => ({
			queryKey,
			queryFn,
			// FIXME: type
			...unref(props.queryOptions) as any,
		})),
		queryClient,
	)

	useQueryCallbacks<CustomResult<TResultData>, TError>({
		queryKey,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	})

	useSubscribe({
		channel: toRef(() => unref(props.realtime)?.channel ?? ''),
		params: toRef(() => unref(props.realtime)?.params),
		meta: toRef(() => unref(queryProps).meta),
		callback: event => unref(props.realtime)?.callback?.(event),
		enabled: () => unref(props.realtime)?.channel != null,
		actions: [RealtimeAction.Any],
	}, context)

	return {
		...query,
		record: computed(() => query.data.value?.data),
	}
}
