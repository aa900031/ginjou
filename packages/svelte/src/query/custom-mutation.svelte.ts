import type { BaseRecord, CustomResult, Params } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CustomMutation } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { extract, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCustomMutationProps<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
	TMutateResult,
> = MaybeAccessor<
	CustomMutation.Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined
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
	TQuery extends Params,
	TPayload extends Params,
> = OverrideProperties<
	CreateMutationResult<
		CustomResult<TData>,
		TError,
		CustomMutation.MutationProps<TData, TError, TQuery, TPayload>,
		any
	>,
	{
		mutate: CustomMutation.MutateFn<TData, TError, TQuery, TPayload>
		mutateAsync: CustomMutation.MutateAsyncFn<TData, TError, TQuery, TPayload>
	}
>

export function useCustomMutation<
	TData extends BaseRecord,
	TError,
	TQuery extends Params,
	TPayload extends Params,
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
	const resolvedProps = $derived(extract(props))

	const mutationFn = CustomMutation.createMutationFn({
		fetchers,
		getProps,
	})
	const onSuccess = CustomMutation.createSuccessHandler({
		notify,
		publish,
		getProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})
	const onError = CustomMutation.createErrorHandler({
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<CustomResult<TData>, TError, CustomMutation.MutationProps<TData, TError, TQuery, TPayload>, any>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationFn,
			onSuccess,
			onError,
		}),
		() => queryClient,
	)

	const mutate = CustomMutation.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = CustomMutation.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return withAccessors(mutation, {
		mutate: () => mutate,
		mutateAsync: () => mutateAsync,
	})

	function getProps(): CustomMutation.Props<TData, TError, TQuery, TPayload, TMutateResult> | undefined {
		return resolvedProps
	}
}
