import type { BaseRecord, CreateManyResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CreateMany } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export interface UseCreateManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
> {
	mutationOptions?: MaybeRef<
		| CreateMany.MutationOptions<TData, TError, TParams>
		| undefined
	>
}

export type UseCreateManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
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
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<CreateManyResult<TData>, TError, CreateMany.MutationProps<TData, TError, TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CreateMany.createMutationFn<TData, TParams>({
			fetchers,
		}),
		onSuccess: CreateMany.createSuccessHandler<TData, TParams>({
			notify,
			translate,
			publish,
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
