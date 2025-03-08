import type { BaseRecord, GetOneResult } from '@ginjou/core'
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
import { createSubscribeCallback, GetOne, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { hashKey, useQuery } from '@tanstack/vue-query'
import { toRef } from '@vueuse/shared'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetOneProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
> = ToMaybeRefs<
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
	& UseQueryReturnType<GetOneResult<TResultData>, TError>
	& {
		record: Ref<TResultData | undefined>
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
	const realtimeOptions = useRealtimeOptions(toRef(() => unref(props.realtime)), context)
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const queryProps = computed(() => GetOne.resolveQueryProps({
		id: unref(props.id),
		resource: unref(props.resource),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
	}))
	const queryKey = computed(() => GetOne.createQueryKey({
		props: unref(queryProps),
	}))
	const isEnabled = computed(() => GetOne.getQueryEnabled({
		enabled: unref(props.queryOptions)?.enabled,
		props: unref(queryProps),
	}))
	const queryFn = GetOne.createQueryFn<TData, TResultData, TError>({
		fetchers,
		getProps: () => unref(queryProps),
	})
	const handleSuccess = GetOne.createSuccessHandler<TData, TResultData>({
		notify,
		getProps: () => unref(queryProps),
		getSuccessNotify: () => unref(props.successNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onSuccess?.(...args),
	})
	const handleError = GetOne.createErrorHandler<TError>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onError?.(...args),
	})

	const query = useQuery<GetOneResult<TData>, TError, GetOneResult<TResultData>>(
		computed(() => ({
			// FIXME: type
			...unref(props.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: isEnabled,
		})),
		queryClient,
	)

	useQueryCallbacks<GetOneResult<TResultData>, TError>({
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
		params: computed(() => GetOne.getSubscribeParams({
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
		enabled: isEnabled,
	}, context)

	return {
		...query,
		record: computed(() => query.data.value?.data),
	}
}
