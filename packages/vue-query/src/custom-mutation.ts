import type { QueryClient, UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { BaseRecord, CustomMutationProps, CustomResult, Fetchers } from '@ginjou/query'
import { createCustomMutationFn } from '@ginjou/query'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import type { MutationOptions } from './types'

export interface UseCustomMutationProps<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
> {
	mutationOptions?: MutationOptions<CustomResult<TData>, TError, CustomMutationProps<TQuery, TPayload>>
}

export interface UseCustomMutationContext {
	queryClient?: QueryClient
	fetchers?: Fetchers
}

export type UseCustomMutationResult<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
> =
	& UseMutationReturnType<CustomResult<TData>, TError, CustomMutationProps<TQuery, TPayload>, any>['mutateAsync']
	& UseMutationReturnType<CustomResult<TData>, TError, CustomMutationProps<TQuery, TPayload>, any>

export function useCustomMutation<
	TData extends BaseRecord = BaseRecord,
	TError = unknown,
	TQuery = unknown,
	TPayload = unknown,
>(
	props?: UseCustomMutationProps<TData, TError, TQuery, TPayload>,
	context?: UseCustomMutationContext,
): UseCustomMutationResult<TData, TError, TQuery, TPayload> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })

	const mutation = useMutation<CustomResult<TData>, TError, CustomMutationProps<TQuery, TPayload>, any>({
		mutationFn: createCustomMutationFn<TData, TQuery, TPayload>(
			fetchers,
		),
		...props?.mutationOptions as any,
		queryClient,
	})

	const fn = mutation.mutateAsync
	Object.assign(fn, mutation)

	return fn as unknown as UseCustomMutationResult<TData, TError, TQuery, TPayload>
}
