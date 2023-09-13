import type { QueryClient, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, GetOneQueryProps, GetOneResult, Meta, RecordKey } from '@ginjou/query'
import { createGetOneQueryFn, genGetOneQueryKey } from '@ginjou/query'
import type { MaybeRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { QueryOptions } from './types'

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
		| QueryOptions<GetOneResult<TData>, TError, GetOneResult<TResultData>>
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

	return useQuery<GetOneResult<TData>, TError, GetOneResult<TResultData>>(computed(() => ({
		...unref(props.queryOptions),
		queryKey: computed(() => genGetOneQueryKey(unref(getOneProps))),
		queryFn: createGetOneQueryFn(
			() => unref(getOneProps),
			queryClient,
			fetchers,
		),
		enabled: computed(() => (
			unref(unref(props.queryOptions)?.enabled)
			?? (
				!!unref(getOneProps).resource
				&& unref(getOneProps).id != null
			)
		)),
		queryClient,
	})))
}
