import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { type MutationObserverOptions, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { DeleteMany } from '@ginjou/core'
import type { BaseRecord, DeleteManyResult } from '@ginjou/core'
import { type UseFetcherContextFromProps, useFetchersContext } from '../query/fetchers'
import { type UseQueryClientContextProps, useQueryClientContext } from '../query/query-client'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'

export interface UseDeleteManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Omit<
				MutationObserverOptions<
					DeleteManyResult<TData>,
					TError,
					DeleteMany.MutationProps<TData, TError, TParams>,
					DeleteMany.MutationContext<TData>
				>,
				| 'mutationFn'
			>
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
		}),
		onMutate: DeleteMany.createMutateHandler<TData, TParams>({
			queryClient,
		}),
		onSettled: DeleteMany.createSettledHandler<TData, TError, TParams>({
			queryClient,
		}),
		onSuccess: DeleteMany.createSuccessHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
		}),
		onError: DeleteMany.createErrorHandler<TError>({
			queryClient,
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}
