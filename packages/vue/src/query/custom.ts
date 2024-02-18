import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, CustomResult } from '@ginjou/core'
import { Custom } from '@ginjou/core'
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

export type UseCustomProps<
	TData extends BaseRecord,
	TError,
	TResultData extends BaseRecord,
	TQuery,
	TPayload,
> = Simplify<
	& ToMaybeRefs<Custom.QueryProps<TQuery, TPayload>>
	& {
		queryOptions?: MaybeRef<
			| QueryObserverOptions<CustomResult<TData>, TError, CustomResult<TResultData>>
			| undefined
		>
		successNotify?: MaybeRef<
			ReturnType<Custom.CreateSuccessHandlerProps<TResultData, TQuery, TPayload>['getSuccessNotify']>
		>
		errorNotify?: MaybeRef<
			ReturnType<Custom.CreateErrorHandlerProps<TError, TQuery, TPayload>['getErrorNotify']>
		>
	}
>

export type UseCustomContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
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
	const { mutateAsync: checkError } = useCheckError(context)

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

	const query = useQuery<CustomResult<TData>, TError, CustomResult<TResultData>>(computed(() => ({
		queryKey,
		queryFn,
		...unref(props.queryOptions),
		onSuccess: handleSuccess,
		onError: handleError,
		queryClient,
	})))

	return {
		...query,
		record: computed(() => query.data.value?.data),
	}
}
