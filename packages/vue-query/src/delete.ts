import { type QueryClient, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { createDeleteErrorHandler, createDeleteMutateHandler, createDeleteMutationFn, createDeleteSettledHandler, createDeleteSuccessHandler } from '@ginjou/query'
import type { BaseRecord, DeleteMutationContext, DeleteMutationProps, DeleteOneResult, Fetchers } from '@ginjou/query'
import type { MaybeRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from './query-client'
import { useFetchersContext } from './fetchers'
import type { MutationOptions } from './types'

export interface UseDeleteProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: MaybeRef<
		| MutationOptions<DeleteOneResult<TData>, TError, DeleteMutationProps<TParams>, DeleteMutationContext<TData>>
		| undefined
	>
}

export interface UseDeleteContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseDeleteResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> =
	& UseMutationReturnType<DeleteOneResult<TData>, TError, DeleteMutationProps<TParams>, DeleteMutationContext<TData>>['mutateAsync']
	& UseMutationReturnType<DeleteOneResult<TData>, TError, DeleteMutationProps<TParams>, DeleteMutationContext<TData>>

export function useDelete<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props?: UseDeleteProps<TData, TError, TParams>,
	context?: UseDeleteContext,
): UseDeleteResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation<DeleteOneResult<TData>, TError, DeleteMutationProps<TParams>, DeleteMutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any,
		mutationFn: createDeleteMutationFn<TData, TParams>(
			queryClient,
			fetchers,
		),
		onMutate: createDeleteMutateHandler<TData, TParams>(
			queryClient,
		),
		onSettled: createDeleteSettledHandler<TData, TParams>(
			queryClient,
		),
		onError: createDeleteErrorHandler<TData, TError, TParams>(
			queryClient,
		),
		onSuccess: createDeleteSuccessHandler<TData, TParams>(
			queryClient,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseDeleteResult<TData, TError, TParams>
}
