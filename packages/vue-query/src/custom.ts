import type { QueryClient } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { BaseRecord, CustomProps, CustomQueryProps, CustomResult, Fetchers, Meta } from '@ginjou/query'
import { createCustomQueryFn, genCustomQueryKey } from '@ginjou/query'
import { type MaybeRef, computed, unref } from 'vue-demi'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { QueryOptions } from './types'

export interface UseCustomProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
	TResultData extends BaseRecord = TData,
> {
	url: MaybeRef<CustomProps<TQuery, TPayload>['url']>
	method: MaybeRef<CustomProps<TQuery, TPayload>['method']>
	sorters?: MaybeRef<CustomProps<TQuery, TPayload>['sorters'] | undefined>
	filters?: MaybeRef<CustomProps<TQuery, TPayload>['filters'] | undefined>
	payload?: MaybeRef<CustomProps<TQuery, TPayload>['payload'] | undefined>
	query?: MaybeRef<CustomProps<TQuery, TPayload>['query'] | undefined>
	headers?: MaybeRef<CustomProps<TQuery, TPayload>['headers'] | undefined>
	meta?: MaybeRef<Meta | undefined>
	fetcherName?: MaybeRef<string | undefined>
	queryOptions?: MaybeRef<
		| QueryOptions<CustomResult<TData>, TError, CustomResult<TResultData>>
		| undefined
	>
}

export interface UseCustomContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export function useCustom<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
	TResultData extends BaseRecord = TData,
>(
	props: UseCustomProps<TData, TError, TQuery, TPayload, TResultData>,
	context?: UseCustomContext,
) {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const customProps = computed<CustomQueryProps<TQuery, TPayload>>(() => ({
		url: unref(props.url),
		method: unref(props.method),
		sorters: unref(props.sorters),
		filters: unref(props.filters),
		payload: unref(props.payload),
		query: unref(props.query),
		headers: unref(props.headers),
		meta: unref(props.meta),
		fetcherName: unref(props.fetcherName),
		queryOptions: unref(props.queryOptions),
	}))

	return useQuery<CustomResult<TData>, TError, CustomResult<TResultData>>(computed(() => ({
		...unref(props.queryOptions),
		queryKey: computed(() => genCustomQueryKey(unref(customProps))),
		queryFn: createCustomQueryFn<TData, TQuery, TPayload>(
			() => unref(customProps),
			fetchers,
		),
		queryClient,
	})))
}
