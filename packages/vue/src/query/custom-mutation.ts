import type { BaseRecord, CustomResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UsePublishContext } from '../realtime'
import { CustomMutation } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError, type UseCheckErrorContext } from '../auth'
import { useTranslate, type UseTranslateContext } from '../i18n'
import { useNotify, type UseNotifyContext } from '../notification'
import { usePublish } from '../realtime'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'
import { useQueryClientContext, type UseQueryClientContextProps } from './query-client'

export interface UseCustomMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	mutationOptions?: MaybeRef<
		| CustomMutation.MutationOptionsFromProps<TData, TError, TQuery, TPayload>
		| undefined
	>
}

export type UseCustomMutationContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseCustomMutationResult<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> = UseMutationReturnType<
	CustomResult<TData>,
	TError,
	CustomMutation.MutationProps<TData, TError, TQuery, TPayload>,
	unknown
>

export function useCustomMutation<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
>(
	props?: UseCustomMutationProps<TData, TError, TQuery, TPayload>,
	context?: UseCustomMutationContext,
): UseCustomMutationResult<TData, TError, TQuery, TPayload> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<CustomResult<TData>, TError, CustomMutation.MutationProps<TData, TError, TQuery, TPayload>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CustomMutation.createMutationFn<TData, TQuery, TPayload>({
			fetchers,
		}),
		onSuccess: CustomMutation.createSuccessHandler<TData, TQuery, TPayload>({
			notify,
			publish,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: CustomMutation.createErrorHandler<TError, TQuery, TPayload>({
			notify,
			translate,
			checkError,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	return mutation
}
