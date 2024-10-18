import type { BaseRecord, DeleteManyResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UsePublishContext } from '../realtime'
import { DeleteMany } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError, type UseCheckErrorContext } from '../auth'
import { useTranslate, type UseTranslateContext } from '../i18n'
import { useNotify, type UseNotifyContext } from '../notification'
import { usePublish } from '../realtime'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'
import { useQueryClientContext, type UseQueryClientContextProps } from './query-client'

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
	& UsePublishContext
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
	const publish = usePublish(context)
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
			publish,
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
