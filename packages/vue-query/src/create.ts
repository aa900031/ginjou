import type { MaybeRef } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import type { QueryClient, UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { BaseRecord, CreateMutateFn, CreateMutationProps, CreateResult, Fetchers } from '@ginjou/query'
import { createCreateMutationFn, createCreateSuccessHandler } from '@ginjou/query'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { MutationOptions } from './types'

export interface UseCreateProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: MaybeRef<
		| MutationOptions<CreateResult<TData>, TError, CreateMutationProps<TParams>>
		| undefined
	>
}

export interface UseCreateContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseCreateResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> =
	& CreateMutateFn<TData, TError, TParams>
	& UseMutationReturnType<CreateResult<TData>, TError, CreateMutationProps<TParams>, any>

export function useCreate<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props?: UseCreateProps<TData, TError, TParams>,
	context?: UseCreateContext,
): UseCreateResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation<CreateResult<TData>, TError, CreateMutationProps<TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions as any),
		mutationFn: createCreateMutationFn<TData, TParams>(
			queryClient,
			fetchers,
		),
		onSuccess: createCreateSuccessHandler<TData, TParams>(
			queryClient,
		),
		queryClient,
	})))

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseCreateResult<TData, TError, TParams>
}
