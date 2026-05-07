import type { BaseRecord, CreateManyResult, Params } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CreateMany } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { extract, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCreateManyProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = MaybeAccessor<
	CreateMany.Props<TData, TError, TParams> | undefined
>

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
	TParams extends Params,
> = OverrideProperties<
	CreateMutationResult<
		CreateManyResult<TData>,
		TError,
		CreateMany.MutationProps<TData, TError, TParams>,
		any
	>,
	{
		mutate: CreateMany.MutateFn<TData, TError, TParams>
		mutateAsync: CreateMany.MutateAsyncFn<TData, TError, TParams>
	}
>

export function useCreateMany<
	TData extends BaseRecord,
	TParams extends Params = TData,
	TError = unknown,
>(
	props?: UseCreateManyProps<TData, TError, TParams>,
	context?: UseCreateManyContext,
): UseCreateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const resolvedProps = $derived(extract(props))
	const mutationFn = CreateMany.createMutationFn({
		fetchers,
		getProps,
	})
	const handleSuccess = CreateMany.createSuccessHandler({
		notify,
		translate,
		publish,
		queryClient,
		getProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})
	const handleError = CreateMany.createErrorHandler({
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<CreateManyResult<TData>, TError, CreateMany.MutationProps<TData, TError, TParams>>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationFn,
			onSuccess: handleSuccess,
			onError: handleError,
		}),
		() => queryClient,
	)

	const mutate = CreateMany.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = CreateMany.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return withAccessors(mutation, {
		mutate: () => mutate,
		mutateAsync: () => mutateAsync,
	})

	function getProps(): CreateMany.Props<TData, TError, TParams> | undefined {
		return resolvedProps
	}
}
