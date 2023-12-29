import type { MaybeRef } from '@vueuse/shared'
import { type QueryClient, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { createDeleteErrorHandler, createDeleteMutateHandler, createDeleteMutationFn, createDeleteSettledHandler, createDeleteSuccessHandler } from '@ginjou/core'
import type { BaseRecord, DeleteMutateFn, DeleteMutationContext, DeleteMutationProps, DeleteOneResult, Fetchers } from '@ginjou/core'
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
	& DeleteMutateFn<TData, TError, TParams>
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
		onMutate: createDeleteMutateHandler<TData, TError, TParams>(
			queryClient,
			unref(props?.mutationOptions)?.onMutate,
		),
		onSettled: createDeleteSettledHandler<TData, TError, TParams>(
			queryClient,
			unref(props?.mutationOptions)?.onSettled,
		),
		onError: createDeleteErrorHandler<TData, TError, TParams>(
			queryClient,
			unref(props?.mutationOptions)?.onError,
		),
		onSuccess: createDeleteSuccessHandler<TData, TError, TParams>(
			queryClient,
			unref(props?.mutationOptions)?.onSuccess,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseDeleteResult<TData, TError, TParams>
}
