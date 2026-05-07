import type { BaseRecord, Params, UpdateManyResult } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { UpdateMany } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { extract } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseUpdateManyProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = MaybeAccessor<
	UpdateMany.Props<TData, TError, TParams> | undefined
>

export type UseUpdateManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseUpdateManyResult<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = OverrideProperties<
	CreateMutationResult<
		UpdateManyResult<TData>,
		TError,
		UpdateMany.MutationProps<TData, TError, TParams>,
		UpdateMany.MutationContext<TData>
	>,
	{
		mutate: UpdateMany.MutateFn<TData, TError, TParams>
		mutateAsync: UpdateMany.MutateAsyncFn<TData, TError, TParams>
	}
>

export function useUpdateMany<
	TData extends BaseRecord,
	TParams extends Params = TData,
	TError = unknown,
>(
	props?: UseUpdateManyProps<TData, TError, TParams>,
	context?: UseUpdateManyContext,
): UseUpdateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)
	const resolvedProps = $derived(extract(props))

	const mutationFn = UpdateMany.createMutationFn({
		fetchers,
		notify,
		translate,
		getProps,
	})
	const handleMutate = UpdateMany.createMutateHandler({
		queryClient,
		notify,
		translate,
		getProps,
		onMutate: (...args) => resolvedProps?.mutationOptions?.onMutate?.(...args),
	})
	const handleSettled = UpdateMany.createSettledHandler<TData, TError, TParams>({
		queryClient,
		getProps,
		onSettled: (...args) => resolvedProps?.mutationOptions?.onSettled?.(...args),
	})
	const handleSuccess = UpdateMany.createSuccessHandler({
		queryClient,
		notify,
		translate,
		publish,
		getProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})
	const handleError = UpdateMany.createErrorHandler({
		queryClient,
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<
		UpdateManyResult<TData>,
		TError,
		UpdateMany.MutationProps<TData, TError, TParams>,
		UpdateMany.MutationContext<TData>
	>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationFn,
			onMutate: handleMutate,
			onSettled: handleSettled,
			onSuccess: handleSuccess,
			onError: handleError,
		}),
		() => queryClient,
	)

	const mutate = UpdateMany.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = UpdateMany.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return Object.assign(mutation, {
		mutate,
		mutateAsync,
	})

	function getProps(): UpdateMany.Props<TData, TError, TParams> | undefined {
		return resolvedProps
	}
}
