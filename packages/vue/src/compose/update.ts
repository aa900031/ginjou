import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { type MutationObserverOptions, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { Update } from '@ginjou/core'
import type { BaseRecord, UpdateResult } from '@ginjou/core'
import { type UseFetcherContextFromProps, useFetchersContext } from '../query/fetchers'
import { type UseQueryClientContextProps, useQueryClientContext } from '../query/query-client'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'

export interface UseUpdateProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Omit<
				MutationObserverOptions<
					UpdateResult<TData>,
					TError,
					Update.MutationProps<TData, TError, TParams>,
					Update.MutationContext<TData>
				>,
				| 'mutationFn'
			>
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
		}),
		onMutate: Update.createMutateHandler<TData, TParams>({
			queryClient,
		}),
		onSettled: Update.createSettledHandler<TData, TError, TParams>({
			queryClient,
		}),
		onSuccess: Update.createSuccessHandler<TData, TParams>({
			notify,
			translate,
		}),
		onError: Update.createErrorHandler<TError>({
			queryClient,
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}
