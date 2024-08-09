import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { type MutationObserverOptions, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { UpdateMany } from '@ginjou/core'
import type { BaseRecord, UpdateManyResult } from '@ginjou/core'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'
import { type UseQueryClientContextProps, useQueryClientContext } from './query-client'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'

export interface UseUpdateManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Omit<
			MutationObserverOptions<
				UpdateManyResult<TData>,
				TError,
				UpdateMany.MutationProps<TData, TError, TParams>,
				UpdateMany.MutationContext<TData>
			>,
			| 'mutationFn'
			| 'onMutate'
			| 'onSettled'
			| 'onSuccess'
			| 'onError'
			| 'queryClient'
		>
		| undefined
	>
}

export type UseUpdateManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseUpdateManyResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = UseMutationReturnType<
	UpdateManyResult<TData>,
	TError,
	UpdateMany.MutationProps<TData, TError, TParams>,
	UpdateMany.MutationContext<TData>
>

export function useUpdateMany<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseUpdateManyProps<TData, TError, TParams>,
	context?: UseUpdateManyContext,
): UseUpdateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<UpdateManyResult<TData>, TError, UpdateMany.MutationProps<TData, TError, TParams>, UpdateMany.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: UpdateMany.createMutationFn<TData, TParams>({
			fetchers,
			notify,
			translate,
		}),
		onMutate: UpdateMany.createMutateHandler<TData, TParams>({
			queryClient,
		}),
		onSettled: UpdateMany.createSettledHandler<TData, TError, TParams>({
			queryClient,
		}),
		onSuccess: UpdateMany.createSuccessHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
		}),
		onError: UpdateMany.createErrorHandler<TError>({
			queryClient,
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}
