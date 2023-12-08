import type { MaybeRef } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import { type QueryClient, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { createDeleteManyErrorHandler, createDeleteManyMutateHandler, createDeleteManyMutationFn, createDeleteManySettledHandler, createDeleteManySuccessHandler } from '@ginjou/query'
import type { BaseRecord, DeleteManyMutateFn, DeleteManyMutationProps, DeleteManyResult, DeleteMutationContext, Fetchers } from '@ginjou/query'
import { useQueryClientContext } from './query-client'
import { useFetchersContext } from './fetchers'
import type { MutationOptions } from './types'

export interface UseDeleteManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: MaybeRef<
		| MutationOptions<DeleteManyResult<TData>, TError, DeleteManyMutationProps<TParams>, DeleteMutationContext<TData>>
		| undefined
	>
}

export interface UseDeleteManyContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseDeleteManyResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> =
	& DeleteManyMutateFn<TData, TError, TParams>
	& UseMutationReturnType<DeleteManyResult<TData>, TError, DeleteManyMutationProps<TParams>, DeleteMutationContext<TData>>

export function useDeleteMany<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: UseDeleteManyProps<TData, TError, TParams>,
	context?: UseDeleteManyContext,
): UseDeleteManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation<DeleteManyResult<TData>, TError, DeleteManyMutationProps<TParams>, DeleteMutationContext<TData>>(computed(() => ({
		...unref(props.mutationOptions) as any,
		mutationFn: createDeleteManyMutationFn<TData, TParams>(
			queryClient,
			fetchers,
		),
		onMutate: createDeleteManyMutateHandler<TData, TParams>(
			queryClient,
		),
		onSettled: createDeleteManySettledHandler<TData, TParams>(
			queryClient,
		),
		onError: createDeleteManyErrorHandler<TData, TParams>(
			queryClient,
		),
		onSuccess: createDeleteManySuccessHandler<TData, TParams>(
			queryClient,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseDeleteManyResult<TData, TError, TParams>
}
