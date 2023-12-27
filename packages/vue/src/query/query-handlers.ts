import type { Simplify } from 'type-fest'
import { computed, unref, watch } from 'vue-demi'
import type { MaybeRef, Ref } from 'vue-demi'
import type { QueryClient, QueryKey, UseQueryOptions } from '@tanstack/vue-query'

export function processQueryOptions(
	queryOptions: MaybeRef<
		| QueryOptions<any, any, any, any>
		| QueryOptionsWithHandlers<any, any, any, any>
		| undefined
	>,
	queryKey: MaybeRef<QueryKey>,
	queryClient: QueryClient,
): Ref<QueryOptions<any, any, any, any>> {
	const splited = computed(() => {
		const { onSuccess, onError, ...rest } = unref(queryOptions) ?? {}
		return {
			queryOptions: rest,
			handlers: {
				onSuccess: unref(onSuccess),
				onError: unref(onError),
			},
		}
	})

	watch(() => [
		unref(queryKey),
		unref(splited).handlers,
	] as const, ([_queryKey, _handlers], _oldValue, onClean) => {
		const unsubscribe = subscribeQueryHandlers(queryClient, _queryKey, _handlers)
		onClean(() => unsubscribe())
	}, { immediate: true, flush: 'sync' })

	return computed(() => unref(splited).queryOptions)
}

export type QueryOptions<
	TQueryFnData,
	TError,
	TData,
	TQueryKey extends QueryKey = QueryKey,
> =	Omit<
	UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
	| 'queryFn'
	| 'queryClientKey'
	| 'queryClient'
>

export type QueryOptionsWithHandlers<
	TQueryFnData,
	TError,
	TData,
	TQueryKey extends QueryKey = QueryKey,
> = Simplify<
	& Omit<
		QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
		| 'onSuccess'
		| 'onError'
		| 'onSettled'
	>
	& QueryHandlers<TData, TError>
>
