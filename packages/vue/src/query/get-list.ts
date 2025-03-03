import type { BaseRecord, GetListResult } from '@ginjou/core'
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
import { createSubscribeCallback, GetList, getSubscribeChannel, RealtimeAction } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { toRef } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useRealtimeOptions, useSubscribe } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseGetListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = ToMaybeRefs<
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
	& UseQueryReturnType<GetListResult<TResultData, TPageParam>, TError>
	& {
		records: Ref<TResultData[] | undefined>
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
	const realtimeOptions = useRealtimeOptions(toRef(() => unref(props.realtime)), context)
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const queryProps = computed(() => GetList.resolveQueryProps<TPageParam>({
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
	const isEnabled = computed(() => GetList.getQueryEnabled({
		enabled: unref(props.queryOptions)?.enabled,
		props: unref(queryProps),
	}))
	const queryFn = GetList.createQueryFn<TData, TResultData, TError, TPageParam>({
		getProps: () => unref(queryProps),
		queryClient,
		fetchers,
	})
	const handleSuccess = GetList.createSuccessHandler<TData, TResultData, TPageParam>({
		notify,
		getProps: () => unref(queryProps),
		getSuccessNotify: () => unref(props.successNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onSuccess?.(...args),
	})
	const handleError = GetList.createErrorHandler<TError, TPageParam>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onError?.(...args),
	})

	const query = useQuery<GetListResult<TData, TPageParam>, TError, GetListResult<TResultData, TPageParam>>(
		computed(() => ({
			// FIXME: type
			...unref(props.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: isEnabled,
			onSuccess: handleSuccess,
			onError: handleError,
		})),
		queryClient,
	)

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
		enabled: isEnabled,
	}, context)

	return {
		...query,
		records: computed(() => query.data.value?.data),
	}
}
