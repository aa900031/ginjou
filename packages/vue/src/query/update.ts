import type { MaybeRef } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import { type QueryClient, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import type { BaseRecord, Fetchers, UpdateMutateFn, UpdateMutationContext, UpdateMutationOptions, UpdateMutationProps, UpdateResult } from '@ginjou/core'
import { createUpdateErrorHandler, createUpdateMutateHandler, createUpdateMutationFn, createUpdateSettledHandler } from '@ginjou/core'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export interface UseUpdateProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: MaybeRef<
		| UpdateMutationOptions<TData, TError, TParams>
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
	& UpdateMutateFn<TData, TError, TParams>
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
			unref(props?.mutationOptions)?.onMutate,
		),
		onSettled: createUpdateSettledHandler<TData, TError, TParams>(
			queryClient,
			unref(props?.mutationOptions)?.onSettled,
		),
		onError: createUpdateErrorHandler<TData, TError, TParams>(
			queryClient,
			unref(props?.mutationOptions)?.onError,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseUpdateResult<TData, TError, TParams>
}
