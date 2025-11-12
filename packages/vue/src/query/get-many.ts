import type { BaseRecord, GetManyResult } from '@ginjou/core'
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
import { createSubscribeCallback, GetMany, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { toRef } from '@vueuse/shared'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = ToMaybeRefs<
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
	& UseQueryReturnType<GetManyResult<TResultData>, TError>
	& {
		records: Ref<TResultData[] | undefined>
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
	const realtimeOptions = useRealtimeOptions(toRef(() => unref(props.realtime)), context)
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const queryProps = computed(() => GetMany.resolveQueryProps({
		ids: unref(props.ids),
		resource: unref(props.resource),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
		aggregate: unref(props.aggregate),
	}))
	const queryKey = computed(() => GetMany.createQueryKey({
		props: unref(queryProps),
	}))
	const enabledFn = GetMany.createQueryEnabledFn({
		getEnabled: () => unref(props.queryOptions)?.enabled,
		getQueryKey: () => unref(queryKey),
		getIds: () => unref(queryProps).ids,
		getResource: () => unref(queryProps).resource,
		queryClient,
	})
	const queryFn = GetMany.createQueryFn<TData, TResultData, TError>({
		fetchers,
		queryClient,
		getProps: () => unref(queryProps),
	})
	const handleSuccess = GetMany.createSuccessHandler<TData, TResultData>({
		getProps: () => unref(queryProps),
		notify,
		getSuccessNotify: () => unref(props.successNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onSuccess?.(...args),
	})
	const handleError = GetMany.createErrorHandler<TError>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onError?.(...args),
	})
	const placeholderData = GetMany.createPlacholerDataFn<TData, TResultData, TError>({
		getProps: () => unref(queryProps),
		queryClient,
	})

	const query = useQuery<GetManyResult<TData>, TError, GetManyResult<TResultData>>(
		computed(() => ({
			// FIXME: type
			...unref(props.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: enabledFn,
			placeholderData,
		})),
		queryClient,
	)
	useQueryCallbacks<GetManyResult<TResultData>, TError>({
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
		params: computed(() => GetMany.getSubscribeParams({
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
		records: computed(() => query.data.value?.data),
	}
}
