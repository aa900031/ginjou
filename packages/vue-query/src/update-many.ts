import { type MaybeRef, computed, unref } from 'vue-demi'
import { type QueryClient, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { createUpdateManyErrorHandler, createUpdateManyMutateHandler, createUpdateManyMutationFn, createUpdateManySettledHandler } from '@ginjou/query'
import type { BaseRecord, Fetchers, UpdateManyMutationProps, UpdateManyResult, UpdateMutationContext } from '@ginjou/query'
import { useQueryClientContext } from './query-client'
import { useFetchersContext } from './fetchers'
import type { MutationOptions } from './types'

export interface UseUpdateManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: MaybeRef<
		| MutationOptions<UpdateManyResult<TData>, TError, UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>>
		| undefined
	>
}

export interface UseUpdateManyContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseUpdateManyResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> =
	& UseMutationReturnType<UpdateManyResult<TData>, TError, UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>>['mutateAsync']
	& UseMutationReturnType<UpdateManyResult<TData>, TError, UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>>

export function useUpdateMany<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: UseUpdateManyProps<TData, TError, TParams>,
	context?: UseUpdateManyContext,
): UseUpdateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation<UpdateManyResult<TData>, TError, UpdateManyMutationProps<TParams>, UpdateMutationContext<TData>>(computed(() => ({
		...unref(props.mutationOptions) as any,
		mutationFn: createUpdateManyMutationFn<TData, TParams>(
			queryClient,
			fetchers,
		),
		onMutate: createUpdateManyMutateHandler<TData, TParams>(
			queryClient,
		),
		onSettled: createUpdateManySettledHandler<TData, TParams>(
			queryClient,
		),
		onError: createUpdateManyErrorHandler<TData, TParams>(
			queryClient,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseUpdateManyResult<TData, TError, TParams>
}
