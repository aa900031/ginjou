import type { BaseRecord, CreateResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { Create } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

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
	TData extends BaseRecord = BaseRecord,
	TParams = TData,
	TError = unknown,
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
