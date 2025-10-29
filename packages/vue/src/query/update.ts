import type { BaseRecord, UpdateResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { UpdateOne } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { unrefs } from '../utils/unrefs'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseUpdateOneProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = ToMaybeRefs<
	UpdateOne.Props<TData, TError, TParams>
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
	TParams,
> = OverrideProperties<
	UseMutationReturnType<
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
	TParams = TData,
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
	const { mutateAsync: checkError } = useCheckError(undefined, context)

	const mutation = useMutation<UpdateResult<TData>, TError, UpdateOne.MutationProps<TData, TError, TParams>, UpdateOne.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: UpdateOne.createMutationFn({
			fetchers,
			notify,
			translate,
			getProps,
		}),
		onMutate: UpdateOne.createMutateHandler({
			queryClient,
			notify,
			translate,
			getProps,
			onMutate: unref(props?.mutationOptions)?.onMutate,
		}),
		onSettled: UpdateOne.createSettledHandler({
			queryClient,
			getProps,
			onSettled: unref(props?.mutationOptions)?.onSettled,
		}),
		onSuccess: UpdateOne.createSuccessHandler({
			queryClient,
			notify,
			translate,
			publish,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: UpdateOne.createErrorHandler({
			queryClient,
			notify,
			translate,
			checkError,
			getProps,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	const mutate = UpdateOne.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = UpdateOne.createMutateAsyncFn({
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
