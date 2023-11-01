import { useQuery } from '@tanstack/vue-query'
import type { QueryClient, UseQueryReturnType } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, GetManyQueryProps, GetManyResult, Meta, RecordKey } from '@ginjou/query'
import { createGetManyPlacholerDataFn, createGetManyQueryFn, genGetManyQueryKey } from '@ginjou/query'
import type { MaybeRef } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from './query-client'
import { useFetchersContext } from './fetchers'
import type { QueryOptions } from './types'
import { toEnabledRef } from './utils'

export interface UseGetManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> {
	ids?: MaybeRef<RecordKey[] | undefined>
	resource?: MaybeRef<string | undefined>
	meta?: MaybeRef<Meta | undefined>
	aggregate?: MaybeRef<boolean | undefined>
	fetcherName?: MaybeRef<string | undefined>
	queryOptions?: MaybeRef<
		| QueryOptions<GetManyResult<TData>, TError, GetManyResult<TResultData>>
		| undefined
	>
}

export interface UseGetManyContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseGetManyResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = UseQueryReturnType<
	GetManyResult<TResultData>,
	TError
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

	const getManyProps = computed<GetManyQueryProps>(() => ({
		ids: unref(props.ids)!,
		resource: unref(props.resource)!,
		meta: unref(props.meta),
		aggregate: unref(props.aggregate),
		fetcherName: unref(props.fetcherName),
		queryOptions: unref(props.queryOptions),
	}))

	const getManyPropsGetter = () => unref(getManyProps)

	return useQuery<GetManyResult<TData>, TError, GetManyResult<TResultData>>(computed(() => ({
		...unref(props.queryOptions),
		queryKey: computed(() => genGetManyQueryKey(unref(getManyProps))),
		queryFn: createGetManyQueryFn<TData>(
			getManyPropsGetter,
			queryClient,
			fetchers,
		),
		placeholderData: createGetManyPlacholerDataFn<TData>(
			getManyPropsGetter,
			queryClient,
		),
		enabled: toEnabledRef(() => (
			!!unref(getManyProps).resource
			&& unref(getManyProps).ids != null
		), props.queryOptions),
		queryClient,
	})))
}
