import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { type MutationObserverOptions, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { Delete } from '@ginjou/core'
import type { BaseRecord, DeleteOneResult } from '@ginjou/core'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'
import { type UseQueryClientContextProps, useQueryClientContext } from './query-client'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'

export interface UseDeleteProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Omit<
				MutationObserverOptions<
					DeleteOneResult<TData>,
					TError,
					Delete.MutationProps<TData, TError, TParams>,
					Delete.MutationContext<TData>
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

export type UseDeleteContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseDeleteResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = UseMutationReturnType<
	DeleteOneResult<TData>,
	TError,
	Delete.MutationProps<TData, TError, TParams>,
	Delete.MutationContext<TData>
>

export function useDelete<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseDeleteProps<TData, TError, TParams>,
	context?: UseDeleteContext,
): UseDeleteResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<DeleteOneResult<TData>, TError, Delete.MutationProps<TData, TError, TParams>, Delete.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: Delete.createMutationFn<TData, TParams>({
			fetchers,
		}),
		onMutate: Delete.createMutateHandler<TData, TParams>({
			queryClient,
		}),
		onSettled: Delete.createSettledHandler<TData, TError, TParams>({
			queryClient,
		}),
		onSuccess: Delete.createSuccessHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
		}),
		onError: Delete.createErrorHandler<TError>({
			queryClient,
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}
