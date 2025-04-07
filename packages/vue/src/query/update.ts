import type { BaseRecord, UpdateResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Update } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

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
	& UsePublishContext
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
	const publish = usePublish(context)
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
			publish,
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
