import type { BaseRecord, Params, UpdateResult } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { MaybeAccessor } from '../utils'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { UpdateOne } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { extract } from '../utils'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseUpdateOneProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = MaybeAccessor<
	UpdateOne.Props<TData, TError, TParams> | undefined
>

export type UseUpdateOneContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseUpdateOneResult<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = OverrideProperties<
	CreateMutationResult<
		UpdateResult<TData>,
		TError,
		UpdateOne.MutationProps<TData, TError, TParams>,
		UpdateOne.MutationContext<TData>
	>,
	{
		mutate: UpdateOne.MutateFn<TData, TError, TParams>
		mutateAsync: UpdateOne.MutateAsyncFn<TData, TError, TParams>
	}
>

export function useUpdateOne<
	TData extends BaseRecord = BaseRecord,
	TParams extends Params = TData,
	TError = unknown,
>(
	props?: UseUpdateOneProps<TData, TError, TParams>,
	context?: UseUpdateOneContext,
): UseUpdateOneResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const resolvedProps = $derived(extract(props))
	const mutationFn = UpdateOne.createMutationFn({
		fetchers,
		notify,
		translate,
		getProps,
	})
	const onMutate = UpdateOne.createMutateHandler({
		queryClient,
		notify,
		translate,
		getProps,
		onMutate: (...args) => resolvedProps?.mutationOptions?.onMutate?.(...args),
	})
	const onSettled = UpdateOne.createSettledHandler({
		queryClient,
		getProps,
		onSettled: (...args) => resolvedProps?.mutationOptions?.onSettled?.(...args),
	})
	const onSuccess = UpdateOne.createSuccessHandler({
		queryClient,
		notify,
		translate,
		publish,
		getProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})
	const onError = UpdateOne.createErrorHandler({
		queryClient,
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<
		UpdateResult<TData>,
		TError,
		UpdateOne.MutationProps<TData, TError, TParams>,
		UpdateOne.MutationContext<TData>
	>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationFn,
			onMutate,
			onSettled,
			onSuccess,
			onError,
			queryClient,
		}),
		() => queryClient,
	)

	const mutate = UpdateOne.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = UpdateOne.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return Object.assign(mutation, {
		mutate,
		mutateAsync,
	})

	function getProps(): UpdateOne.Props<TData, TError, TParams> | undefined {
		return resolvedProps
	}
}
