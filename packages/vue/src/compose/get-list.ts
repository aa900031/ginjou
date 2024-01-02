import type { MaybeRef, Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, GetListResult } from '@ginjou/core'
import { GetList } from '@ginjou/core'
import type { Simplify } from 'type-fest'
import { toValue } from '@vueuse/shared'
import type { UseFetcherContextFromProps } from '../query'
import { useFetchersContext } from '../query'
import type { UseQueryClientContextProps } from '../query/query-client'
import { useQueryClientContext } from '../query/query-client'
import type { UseNotifyContext } from '../notification'
import { useNotify } from '../notification'
import type { UseTranslateContext } from '../i18n'
import { useTranslate } from '../i18n'
import type { UseCheckErrorContext } from '../auth'
import { useCheckError } from '../auth'
import type { ToMaybeRefs } from '../utils/refs'

export type UseGetListProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TPageParam,
> = Simplify<
	& ToMaybeRefs<GetList.QueryProps<TPageParam>>
	& {
		queryOptions?: MaybeRef<
			| QueryObserverOptions<GetListResult<TData>, TError, GetListResult<TResultData>>
			| undefined
		>
		successNotify?: MaybeRef<
			ReturnType<GetList.CreateSuccessHandlerProps<TResultData, TPageParam>['getSuccessNotify']>
		>
		errorNotify?: MaybeRef<
			ReturnType<GetList.CreateErrorHandlerProps<TError, TPageParam>['getErrorNotify']>
		>
	}
>

export type UseGetListContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
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
	const queryFn = GetList.createQueryFn<TData, TResultData, TError, TPageParam>({
		getProps: () => unref(queryProps),
		queryClient,
		fetchers,
	})
	const handleSuccess = GetList.createSuccessHandler<TData, TResultData, TPageParam>({
		notify,
		getProps: () => unref(queryProps),
		getSuccessNotify: () => unref(props.successNotify),
	})
	const handleError = GetList.createErrorHandler<TError, TPageParam>({
		notify,
		translate,
		checkError,
		getProps: () => unref(queryProps),
		getErrorNotify: () => unref(props.errorNotify),
	})

	const query = useQuery<GetListResult<TData, TPageParam>, TError, GetListResult<TResultData, TPageParam>>(computed(() => ({
		...unref(props.queryOptions),
		queryKey,
		queryFn,
		enabled: isEnabled,
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	})))

	return {
		...query,
		records: computed(() => query.data.value?.data),
	}
}
