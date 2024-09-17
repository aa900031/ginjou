import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import { DeleteMany } from '@ginjou/core'
import type { BaseRecord, DeleteManyResult } from '@ginjou/core'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'
import { type UseQueryClientContextProps, useQueryClientContext } from './query-client'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'

export interface UseDeleteManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| DeleteMany.MutationOptionsFromProps<TData, TError, TParams>
		| undefined
	>
}

export type UseDeleteManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseDeleteManyResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = UseMutationReturnType<
	DeleteManyResult<TData>,
	TError,
	DeleteMany.MutationProps<TData, TError, TParams>,
	DeleteMany.MutationContext<TData>
>

export function useDeleteMany<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseDeleteManyProps<TData, TError, TParams>,
	context?: UseDeleteManyContext,
): UseDeleteManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<DeleteManyResult<TData>, TError, DeleteMany.MutationProps<TData, TError, TParams>, DeleteMany.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: DeleteMany.createMutationFn<TData, TParams>({
			fetchers,
			notify,
			translate,
		}),
		onMutate: DeleteMany.createMutateHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
			onMutate: unref(props?.mutationOptions)?.onMutate,
		}),
		onSettled: DeleteMany.createSettledHandler<TData, TError, TParams>({
			queryClient,
			onSettled: unref(props?.mutationOptions)?.onSettled,
		}),
		onSuccess: DeleteMany.createSuccessHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: DeleteMany.createErrorHandler<TError, TParams>({
			queryClient,
			notify,
			translate,
			checkError,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	return mutation
}
