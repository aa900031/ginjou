import type { BaseRecord, UpdateManyResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { UpdateMany } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'
import { unrefs } from '../utils/unrefs'
import { ToMaybeRefs } from '../utils/refs'

export type UseUpdateManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
> = ToMaybeRefs<
	UpdateMany.Props<TData, TError, TParams>
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
	TParams,
> = OverrideProperties<
	UseMutationReturnType<
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
	TError,
	TParams,
>(
	props?: UseUpdateManyProps<TData, TError, TParams>,
	context?: UseUpdateManyContext,
): UseUpdateManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<UpdateManyResult<TData>, TError, UpdateMany.MutationProps<TData, TError, TParams>, UpdateMany.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: UpdateMany.createMutationFn({
			fetchers,
			notify,
			translate,
			getProps,
		}),
		onMutate: UpdateMany.createMutateHandler({
			queryClient,
			notify,
			translate,
			getProps,
			onMutate: unref(props?.mutationOptions)?.onMutate,
		}),
		onSettled: UpdateMany.createSettledHandler<TData, TError, TParams>({
			queryClient,
			getProps,
			onSettled: unref(props?.mutationOptions)?.onSettled,
		}),
		onSuccess: UpdateMany.createSuccessHandler({
			queryClient,
			notify,
			translate,
			publish,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: UpdateMany.createErrorHandler({
			queryClient,
			notify,
			translate,
			checkError,
			getProps,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	const mutate = UpdateMany.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = UpdateMany.createMutateAsyncFn({
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
