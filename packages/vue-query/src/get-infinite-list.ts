import type { MaybeRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import type { QueryClient, UseInfiniteQueryReturnType } from '@tanstack/vue-query'
import { useInfiniteQuery } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, Filters, GetInfiniteListResult, GetListQueryProps, Meta, PaginationPayload, Sorters } from '@ginjou/query'
import { createGetInfiniteListQueryFn, genGetListQueryKey, getNextPageParam, getPreviousPageParam } from '@ginjou/query'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { QueryOptions } from './types'

export interface UseGetInfiniteListProps<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> {
	resource?: MaybeRef<string | undefined>
	pagination?: MaybeRef<PaginationPayload<TPageParam> | undefined>
	sorters?: MaybeRef<Sorters | undefined>
	filters?: MaybeRef<Filters | undefined>
	meta?: MaybeRef<Meta | undefined>
	fetcherName?: MaybeRef<string | undefined>
	queryOptions?: QueryOptions<GetInfiniteListResult<TData, TPageParam>, TError, GetInfiniteListResult<TResultData, TPageParam>>
}

export interface UseGetInfiniteListContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseGetInfiniteListResult<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
	TError = unknown,
	TResultData extends BaseRecord = TData,
> = UseInfiniteQueryReturnType<
	GetInfiniteListResult<TResultData, TPageParam>,
	TError
>

export function useGetInfiniteList<
	TData extends BaseRecord = BaseRecord,
	TPageParam = number,
	TError = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseGetInfiniteListProps<TData, TPageParam, TError, TResultData>,
	context?: UseGetInfiniteListContext,
): UseGetInfiniteListResult<TData, TPageParam, TError, TResultData> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const getListProps = computed<GetListQueryProps<TPageParam>>(() => ({
		resource: unref(props.resource) ?? '',
		pagination: unref(props.pagination),
		sorters: unref(props.sorters),
		filters: unref(props.filters),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
	}))

	return useInfiniteQuery<GetInfiniteListResult<TData, TPageParam>, TError, GetInfiniteListResult<TResultData, TPageParam>, any>({
		queryKey: computed(() => genGetListQueryKey(unref(getListProps))),
		queryFn: createGetInfiniteListQueryFn<TData, TPageParam>(
			() => unref(getListProps),
			queryClient,
			fetchers,
		),
		getNextPageParam,
		getPreviousPageParam,
		...props.queryOptions,
		queryClient,
	})
}
