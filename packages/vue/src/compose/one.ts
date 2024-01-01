import type { Simplify } from 'type-fest'
import type { Ref } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { type MaybeRef, toValue } from '@vueuse/shared'
import type { QueryClient, QueryKey, QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, GetOneResult, Meta, RecordKey } from '@ginjou/core'
import { GetOne } from '@ginjou/core'
import { useFetchersContext } from '../query'
import { useNotify } from '../notification'
import { useTranslate } from '../i18n'
import { useCheckError } from '../auth'
import { useQueryClientContext } from '../query/query-client'

export interface UseGetOneProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> {
	id?: MaybeRef<RecordKey | undefined>
	resource?: MaybeRef<string | undefined>
	meta?: MaybeRef<Meta | undefined>
	fetcherName?: MaybeRef<string | undefined>
	successNotify?: MaybeRef<GetOne.QueryProps<TResultData, TError>['successNotify']>
	errorNotify?: MaybeRef<GetOne.QueryProps<TResultData, TError>['errorNotify']>
	queryOptions?: MaybeRef<
		| QueryObserverOptions<GetOneResult<TData>, TError, GetOneResult<TResultData>>
		| undefined
	>
}

export interface UseGetOneContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseGetOneResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = Simplify<
	& UseQueryReturnType<
		GetOneResult<TResultData>,
		TError
	>
	& {
		record: Ref<TResultData | undefined>
	}
>

export function useOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetOneProps<TData, TError, TResultData>,
	context?: UseGetOneContext,
): UseGetOneResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify()
	const translate = useTranslate()
	const { mutateAsync: checkError } = useCheckError()

	const queryProps = computed<GetOne.QueryProps<TResultData, TError>>(() => ({
		id: unref(props.id)!,
		resource: unref(props.resource) ?? '',
		meta: unref(props.meta),
		successNotify: unref(props.successNotify),
		errorNotify: unref(props.errorNotify),
		fetcherName: unref(props.fetcherName),
	}))
	const queryKey = computed<QueryKey>(() => GetOne.createQueryKey<TResultData, TError>({
		props: unref(queryProps),
	}))
	const isEnabled = computed(() => GetOne.getQueryEnabled({
		enabled: toValue(unref(props.queryOptions)?.enabled),
		props: unref(queryProps),
	}))
	const queryFn = GetOne.createQueryFn<TData, TResultData, TError>({
		getProps: () => unref(queryProps) as any,
		fetchers,
	})
	const handleSuccess = GetOne.createSuccessHandler<TData, TResultData>({
		notify,
		getProps: () => unref(queryProps) as any,
	})
	const handleError = GetOne.createErrorHandler<TError>({
		notify,
		getProps: () => unref(queryProps),
		translate,
		checkError,
	})

	const query = useQuery<GetOneResult<TData>, TError, GetOneResult<TResultData>>(computed(() => ({
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
		record: computed(() => query.data.value?.data),
	}
}
