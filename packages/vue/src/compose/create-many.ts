import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { BaseRecord, CreateManyResult } from '@ginjou/core'
import { CreateMany } from '@ginjou/core'
import { type MutationObserverOptions, type UseMutationReturnType, useMutation } from '@tanstack/vue-query'
import { type UseFetcherContextFromProps, useFetchersContext } from '../query/fetchers'
import { type UseQueryClientContextProps, useQueryClientContext } from '../query/query-client'
import { type UseNotifyContext, useNotify } from '../notification'
import { type UseTranslateContext, useTranslate } from '../i18n'
import { type UseCheckErrorContext, useCheckError } from '../auth'

export interface UseCreateManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Omit<
				MutationObserverOptions<CreateManyResult<TData>, TError, CreateMany.MutationProps<TData, TError, TParams>, any>,
				| 'mutationFn'
			>
		| undefined
	>
}

export type UseCreateManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
>

export type UseCreateManyResult<
	TData extends BaseRecord,
	TError,
	TParams,
> = UseMutationReturnType<
	CreateManyResult<TData>,
	TError,
	CreateMany.MutationProps<TData, TError, TParams>,
	any
>

export function useCreateMany<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseCreateManyProps<TData, TError, TParams>,
	context?: UseCreateManyContext,
): UseCreateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<CreateManyResult<TData>, TError, CreateMany.MutationProps<TData, TError, TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CreateMany.createMutationFn<TData, TParams>({
			fetchers,
		}),
		onSuccess: CreateMany.createSuccessHandler<TData, TParams>({
			notify,
			translate,
			queryClient,
		}),
		onError: CreateMany.createErrorHandler<TError>({
			notify,
			translate,
			checkError,
		}),
		queryClient,
	})))

	return mutation
}
