import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { toValue } from '@vueuse/shared'
import type { QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, GetManyResult } from '@ginjou/core'
import { GetMany } from '@ginjou/core'
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

export type UseGetManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& ToMaybeRefs<GetMany.QueryProps>
	& {
		queryOptions?: MaybeRef<
			| QueryObserverOptions<GetManyResult<TData>, TError, GetManyResult<TResultData>>
			| undefined
		>
		successNotify?: MaybeRef<
			ReturnType<GetMany.CreateSuccessHandlerProps<TResultData>['getSuccessNotify']>
		>
		errorNotify?: MaybeRef<
			ReturnType<GetMany.CreateErrorHandlerProps<TError>['getErrorNotify']>
		>
	}
>

export type UseGetManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
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
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

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
	const isEnabled = computed(() => GetMany.getQueryEnabled({
		enabled: toValue(unref(props.queryOptions)?.enabled),
		props: unref(queryProps),
	}))
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

	const query = useQuery<GetManyResult<TData>, TError, GetManyResult<TResultData>>(computed(() => ({
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
