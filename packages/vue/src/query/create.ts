import type { BaseRecord, CreateResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UsePublishContext } from '../realtime'
import { Create } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError, type UseCheckErrorContext } from '../auth'
import { useTranslate, type UseTranslateContext } from '../i18n'
import { useNotify, type UseNotifyContext } from '../notification'
import { usePublish } from '../realtime'
import { type UseFetcherContextFromProps, useFetchersContext } from './fetchers'
import { useQueryClientContext, type UseQueryClientContextProps } from './query-client'

export interface UseCreateProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| Create.MutationOptionsFromProps<TData, TError, TParams>
		| undefined
	>
}

export type UseCreateContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
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
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<CreateResult<TData>, TError, Create.MutationProps<TData, TError, TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: Create.createMutationFn<TData, TParams>({
			fetchers,
		}),
		onSuccess: Create.createSuccessHandler<TData, TParams>({
			notify,
			translate,
			publish,
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
