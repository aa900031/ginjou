import type { QueryClient, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import type { BaseRecord, Fetchers, Filters, GetListQueryProps, GetListResult, Meta, Pagination, Sorters } from '@ginjou/query'
import { createGetListQueryFn, genGetListQueryKey } from '@ginjou/query'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { QueryOptions } from './types'
import { toEnabledRef } from './utils'

export interface UseGetListProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> {
	resource?: MaybeRef<string | undefined>
	pagination?: MaybeRef<Pagination | undefined>
	sorters?: MaybeRef<Sorters | undefined>
	filters?: MaybeRef<Filters | undefined>
	meta?: MaybeRef<Meta | undefined>
	fetcherName?: MaybeRef<string | undefined>
	queryOptions?: MaybeRef<
		| QueryOptions<GetListResult<TData>, TError, GetListResult<TResultData>>
		| undefined
	>
}

export interface UseGetListContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseGetListResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = UseQueryReturnType<
	GetListResult<TResultData>,
	TError
>

export function useGetList<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetListProps<TData, TError, TResultData>,
	context?: UseGetListContext,
): UseGetListResult<TData, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const getListProps = computed<GetListQueryProps>(() => ({
		resource: unref(props.resource) ?? '',
		pagination: unref(props.pagination),
		sorters: unref(props.sorters),
		filters: unref(props.filters),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
	}))

	return useQuery<GetListResult<TData>, TError, GetListResult<TResultData>>(computed(() => ({
		...unref(props.queryOptions),
		queryKey: computed(() => genGetListQueryKey(unref(getListProps))),
		queryFn: createGetListQueryFn<TData>(
			() => unref(getListProps),
			queryClient,
			fetchers,
		),
		enabled: toEnabledRef(() => !!unref(getListProps).resource, props.queryOptions),
		queryClient,
	})))
}
