import type { MaybeRef } from '@vueuse/shared'
import type { QueryClient, QueryKey, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, GetOneQueryProps, GetOneResult, Meta, RecordKey } from '@ginjou/core'
import { createGetOneQueryFn, genGetOneQueryKey } from '@ginjou/core'
import { computed, unref } from 'vue-demi'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import { toEnabledRef } from './utils'
import type { QueryOptionsWithHandlers } from './query-handlers'
import { processQueryOptions } from './query-handlers'

export interface UseGetOneProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> {
	id?: MaybeRef<RecordKey | undefined>
	resource?: MaybeRef<string | undefined>
	meta?: MaybeRef<Meta | undefined>
	fetcherName?: MaybeRef<string | undefined>
	queryOptions?: MaybeRef<
		| QueryOptionsWithHandlers<GetOneResult<TData>, TError, GetOneResult<TResultData>>
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
> = UseQueryReturnType<
	GetOneResult<TResultData>,
	TError
>

export function useGetOne<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetOneProps<TData, TError, TResultData>,
	context?: UseGetOneContext,
): UseGetOneResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const getOneProps = computed<GetOneQueryProps>(() => ({
		id: unref(props.id)!,
		resource: unref(props.resource) ?? '',
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
	}))
	const queryKey = computed<QueryKey>(() => genGetOneQueryKey(unref(getOneProps)))
	const queryOptions = processQueryOptions(props.queryOptions, queryKey, queryClient)

	const queryFn = createGetOneQueryFn<TData, TResultData>(
		() => unref(getOneProps),
		queryClient,
		fetchers,
	)

	const isEnabled = toEnabledRef(() => (
		!!unref(getOneProps).resource
		&& unref(getOneProps).id != null
	), props.queryOptions)

	return useQuery<GetOneResult<TData>, TError, GetOneResult<TResultData>>(computed(() => ({
		...unref(queryOptions),
		queryKey,
		queryFn,
		enabled: isEnabled,
		queryClient,
	})))
}
