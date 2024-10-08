import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import { Update } from '@ginjou/core'
import type { BaseRecord, UpdateResult } from '@ginjou/core'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'
import { type UseQueryClientContextProps, useQueryClientContext } from './query-client'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'

export interface UseUpdateProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Update.MutationOptionsFromProps<TData, TError, TParams>
		| undefined
	>
}

export type UseUpdateContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseUpdateResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = UseMutationReturnType<
	UpdateResult<TData>,
	TError,
	Update.MutationProps<TData, TError, TParams>,
	Update.MutationContext<TData>
>

export function useUpdate<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseUpdateProps<TData, TError, TParams>,
	context?: UseUpdateContext,
): UseUpdateResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<UpdateResult<TData>, TError, Update.MutationProps<TData, TError, TParams>, Update.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: Update.createMutationFn<TData, TParams>({
			fetchers,
			notify,
			translate,
		}),
		onMutate: Update.createMutateHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
			onMutate: unref(props?.mutationOptions)?.onMutate,
		}),
		onSettled: Update.createSettledHandler<TData, TError, TParams>({
			queryClient,
			onSettled: unref(props?.mutationOptions)?.onSettled,
		}),
		onSuccess: Update.createSuccessHandler<TData, TParams>({
			queryClient,
			notify,
			translate,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: Update.createErrorHandler<TError, TParams>({
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
