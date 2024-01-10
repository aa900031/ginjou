import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { MutationObserverOptions, UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { BaseRecord, CustomResult } from '@ginjou/core'
import { CustomMutation } from '@ginjou/core'
import { type UseFetcherContextFromProps, useFetchersContext } from '../query/fetchers'
import { type UseQueryClientContextProps, useQueryClientContext } from '../query/query-client'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'

export interface UseCustomMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
> {
	mutationOptions?: MaybeRef<
		| Omit<
				MutationObserverOptions<
					CustomResult<TData>,
					TError,
					CustomMutation.MutationProps<TData, TError, TQuery, TPayload>,
					any
				>,
				| 'mutationFn'
			>
		| undefined
	>
}

export type UseCustomMutationContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
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
	any
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
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<CustomResult<TData>, TError, CustomMutation.MutationProps<TData, TError, TQuery, TPayload>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CustomMutation.createMutationFn<TData, TQuery, TPayload>({
			fetchers,
		}),
		onSuccess: CustomMutation.createSuccessHandler<TData, TQuery, TPayload>({
			notify,
		}),
		onError: CustomMutation.createErrorHandler<TError, TQuery, TPayload>({
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}
