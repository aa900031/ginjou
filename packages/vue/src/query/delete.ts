import type { BaseRecord, DeleteOneResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Delete } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export interface UseDeleteProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Delete.MutationOptionsFromProps<TData, TError, TParams>
		| undefined
	>
}

export type UseDeleteContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
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
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<DeleteOneResult<TData>, TError, Delete.MutationProps<TData, TError, TParams>, Delete.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: Delete.createMutationFn<TData, TParams>({
			fetchers,
			notify,
			translate,
		}),
		onMutate: Delete.createMutateHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
			onMutate: unref(props?.mutationOptions)?.onMutate,
		}),
		onSettled: Delete.createSettledHandler<TData, TError, TParams>({
			queryClient,
			onSettled: unref(props?.mutationOptions)?.onSettled,
		}),
		onSuccess: Delete.createSuccessHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
			publish,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: Delete.createErrorHandler<TError, TParams>({
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
