import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { MutationObserverOptions, UseMutationReturnType } from '@tanstack/vue-query'
import { useMutation } from '@tanstack/vue-query'
import type { BaseRecord, CreateResult } from '@ginjou/core'
import { Create } from '@ginjou/core'
import { type UseFetcherContextFromProps, useFetchersContext } from '../query/fetchers'
import { type UseQueryClientContextProps, useQueryClientContext } from '../query/query-client'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'

export interface UseCreateProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Omit<
				MutationObserverOptions<
					CreateResult<TData>,
					TError,
					Create.MutationProps<TData, TError, TParams>,
					any
				>,
				| 'mutationFn'
			>
		| undefined
	>
}

export type UseCreateContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseCreateResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = UseMutationReturnType<
	CreateResult<TData>,
	TError,
	Create.MutationProps<TData, TError, TParams>,
	any
>

export function useCreate<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseCreateProps<TData, TError, TParams>,
	context?: UseCreateContext,
): UseCreateResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<CreateResult<TData>, TError, Create.MutationProps<TData, TError, TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: Create.createMutationFn<TData, TParams>({
			fetchers,
		}),
		onSuccess: Create.createSuccessHandler<TData, TParams>({
			notify,
			translate,
			queryClient,
		}),
		onError: Create.createErrorHandler<TError>({
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}