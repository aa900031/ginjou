import type { BaseRecord, CustomResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CustomMutation } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { unrefs } from '../utils/unrefs'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCustomMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
	TMutateResult,
> = ToMaybeRefs<
	CustomMutation.Props<TData, TError, TQuery, TPayload, TMutateResult>
>

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
> = OverrideProperties<
	UseMutationReturnType<
		CustomResult<TData>,
		TError,
		CustomMutation.MutationProps<TData, TError, TQuery, TPayload>,
		unknown
	>,
	{
		mutate: CustomMutation.MutateFn<TData, TError, TQuery, TPayload>
		mutateAsync: CustomMutation.MutateAsyncFn<TData, TError, TQuery, TPayload>
	}
>

export function useCustomMutation<
	TData extends BaseRecord,
	TError,
	TQuery,
	TPayload,
	TMutateResult,
>(
	props?: UseCustomMutationProps<TData, TError, TQuery, TPayload, TMutateResult>,
	context?: UseCustomMutationContext,
): UseCustomMutationResult<TData, TError, TQuery, TPayload> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const mutation = useMutation<CustomResult<TData>, TError, CustomMutation.MutationProps<TData, TError, TQuery, TPayload>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CustomMutation.createMutationFn({
			fetchers,
			getProps,
		}),
		onSuccess: CustomMutation.createSuccessHandler({
			notify,
			publish,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: CustomMutation.createErrorHandler({
			notify,
			translate,
			checkError,
			getProps,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	const mutate = CustomMutation.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = CustomMutation.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}

	function getProps() {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
