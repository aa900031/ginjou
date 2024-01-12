import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { toValue } from '@vueuse/shared'
import type { InfiniteQueryObserverOptions, UseInfiniteQueryReturnType } from '@tanstack/vue-query'
import { useInfiniteQuery } from '@tanstack/vue-query'
import type { BaseRecord, GetInfiniteListResult } from '@ginjou/core'
import { GetInfiniteList, GetList } from '@ginjou/core'
import type { UseNotifyContext } from '../notification'
import { useNotify } from '../notification'
import type { UseTranslateContext } from '../i18n'
import { useTranslate } from '../i18n'
import type { UseCheckErrorContext } from '../auth'
import { useCheckError } from '../auth'
import type { ToMaybeRefs } from '../utils/refs'
import { useQueryClientContext } from './query-client'
import type { UseQueryClientContextProps } from './query-client'
import { useFetchersContext } from './fetchers'
import type { UseFetcherContextFromProps } from './fetchers'

export type UseGetInfiniteListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& ToMaybeRefs<GetList.QueryProps<TPageParam>>
	& {
		queryOptions?: MaybeRef<
			| Omit<
					InfiniteQueryObserverOptions<GetInfiniteListResult<TData, TPageParam>, TError, GetInfiniteListResult<TResultData, TPageParam>>,
					| 'queryFn'
					| 'queryKey'
					| 'queryClient'
				>
			| undefined
		>
		successNotify?: MaybeRef<
			ReturnType<GetInfiniteList.CreateSuccessHandlerProps<TResultData, TPageParam>['getSuccessNotify']>
		>
		errorNotify?: MaybeRef<
			ReturnType<GetInfiniteList.CreateErrorHandlerProps<TError, TPageParam>['getErrorNotify']>
		>
	}
>

export type UseGetInfiniteListContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseGetInfiniteListResult<
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& UseInfiniteQueryReturnType<GetInfiniteListResult<TResultData, TPageParam>, TError>
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
	const { mutateAsync: checkError } = useCheckError(context)

	const queryProps = computed(() => GetList.resolveQueryProps<TPageParam>({
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
		enabled: toValue(unref(props.queryOptions)?.enabled),
		props: unref(queryProps),
	}))
	const queryFn = GetInfiniteList.createQueryFn<TData, TError, TResultData, TPageParam>({
		getProps: () => unref(queryProps),
		queryClient,
		fetchers,
	})
	const handleSuccess = GetInfiniteList.createSuccessHandler<TData, TResultData, TPageParam>({
		notify,
		getProps: () => unref(queryProps),
		getSuccessNotify: () => unref(props.successNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onSuccess?.(...args),
	})
	const handleError = GetInfiniteList.createErrorHandler<TError, TPageParam>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
		emitParent: (...args) => unref(props.queryOptions)?.onError?.(...args),
	})

	const query = useInfiniteQuery<GetInfiniteListResult<TData, TPageParam>, TError, GetInfiniteListResult<TResultData, TPageParam>, any>(computed(() => ({
		getNextPageParam: GetInfiniteList.getNextPageParam,
		getPreviousPageParam: GetInfiniteList.getPreviousPageParam,
		...unref(props.queryOptions),
		queryKey,
		queryFn,
		enabled: isEnabled,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	})))

	return query
}
