import type { MaybeRef } from 'vue-demi'
import { computed, unref } from 'vue-demi'
import { type QueryClient, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, UpdateMutationContext, UpdateMutationProps, UpdateResult } from '@ginjou/query'
import { createUpdateErrorHandler, createUpdateMutateHandler, createUpdateMutationFn, createUpdateSettledHandler } from '@ginjou/query'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { MutationOptions } from './types'

export interface UseUpdateProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: MaybeRef<
		| MutationOptions<UpdateResult<TData>, TError, UpdateMutationProps<TParams>, UpdateMutationContext<TData>>
		| undefined
	>
}

export interface UseUpdateContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseUpdateResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> =
	& UseMutationReturnType<UpdateResult<TData>, TError, UpdateMutationProps<TParams>, UpdateMutationContext<TData>>['mutateAsync']
	& UseMutationReturnType<UpdateResult<TData>, TError, UpdateMutationProps<TParams>, UpdateMutationContext<TData>>

export function useUpdate<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props?: UseUpdateProps<TData, TError, TParams>,
	context?: UseUpdateContext,
): UseUpdateResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation<UpdateResult<TData>, TError, UpdateMutationProps<TParams>, UpdateMutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any,
		mutationFn: createUpdateMutationFn<TData, TParams>(
			queryClient,
			fetchers,
		),
		onMutate: createUpdateMutateHandler<TData, TParams>(
			queryClient,
		),
		onSettled: createUpdateSettledHandler<TData, TError, TParams>(
			queryClient,
		),
		onError: createUpdateErrorHandler<TData, TError, TParams>(
			queryClient,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseUpdateResult<TData, TError, TParams>
}
