import type { BaseRecord, CreateResult, Params } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CreateOne } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { extract, withAccessors } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCreateOneProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = MaybeAccessor<
	CreateOne.Props<TData, TError, TParams> | undefined
>

export type UseCreateOneContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseCreateOneResult<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = OverrideProperties<
	CreateMutationResult<
		CreateResult<TData>,
		TError,
		CreateOne.MutationProps<TData, TError, TParams>,
		any
	>,
	{
		mutate: CreateOne.MutateFn<TData, TError, TParams>
		mutateAsync: CreateOne.MutateAsyncFn<TData, TError, TParams>
	}
>

export function useCreateOne<
	TData extends BaseRecord = BaseRecord,
	TParams extends Params = TData,
	TError = unknown,
>(
	props?: UseCreateOneProps<TData, TError, TParams>,
	context?: UseCreateOneContext,
): UseCreateOneResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const resolvedProps = $derived(extract(props))
	const mutationFn = CreateOne.createMutationFn<TData, TError, TParams>({
		fetchers,
		getProps,
	})
	const handleSuccess = CreateOne.createSuccessHandler({
		notify,
		translate,
		publish,
		getProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
		queryClient,
	})
	const handleError = CreateOne.createErrorHandler({
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<CreateResult<TData>, TError, CreateOne.MutationProps<TData, TError, TParams>>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationFn,
			onSuccess: handleSuccess,
			onError: handleError,
		}),
		() => queryClient,
	)

	const mutate = CreateOne.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = CreateOne.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return withAccessors(mutation, {
		mutate: () => mutate,
		mutateAsync: () => mutateAsync,
	}) as UseCreateOneResult<TData, TError, TParams>

	function getProps(): CreateOne.Props<TData, TError, TParams> | undefined {
		return resolvedProps
	}
}
