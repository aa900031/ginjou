import type { QueryClient, UseMutationOptions, UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import { createCreateManyMutationFn, createCreateManySuccessHandler } from '@ginjou/query'
import type { BaseRecord, CreateManyMutationProps, CreateManyResult, Fetchers } from '@ginjou/query'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export interface UseCreateManyProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> {
	mutationOptions?: Omit<
		UseMutationOptions<CreateManyResult<TData>, TError, CreateManyMutationProps<TParams>, any>,
		| 'mutationFn'
	>
}

export interface UseCreateManyContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseCreateManyResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
> =
	& UseMutationReturnType<CreateManyResult<TData>, TError, CreateManyMutationProps<TParams>, any>['mutateAsync']
	& UseMutationReturnType<CreateManyResult<TData>, TError, CreateManyMutationProps<TParams>, any>

export function useCreateMany<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TParams extends Record<string, any> = any,
>(
	props: UseCreateManyProps<TData, TError, TParams>,
	context?: UseCreateManyContext,
): UseCreateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation({
		mutationFn: createCreateManyMutationFn<TData, TParams>(
			queryClient,
			fetchers,
		),
		onSuccess: createCreateManySuccessHandler<TData, TParams>(
			queryClient,
		),
		...props.mutationOptions as any,
		queryClient,
	})

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseCreateManyResult<TData, TError, TParams>
}
