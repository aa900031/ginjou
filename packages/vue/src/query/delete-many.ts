import type { BaseRecord, DeleteManyResult, Params } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { DeleteMany } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { unrefs } from '../utils/unrefs'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseDeleteManyProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = ToMaybeRefs<
	DeleteMany.Props<TData, TError, TParams>
>

export type UseDeleteManyContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseDeleteManyResult<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = OverrideProperties<
	UseMutationReturnType<
		DeleteManyResult<TData>,
		TError,
		DeleteMany.MutationProps<TData, TError, TParams>,
		DeleteMany.MutationContext<TData>
	>,
	{
		mutate: DeleteMany.MutateFn<TData, TError, TParams>
		mutateAsync: DeleteMany.MutateAsyncFn<TData, TError, TParams>
	}
>

export function useDeleteMany<
	TData extends BaseRecord,
	TParams extends Params = TData,
	TError = unknown,
>(
	props?: UseDeleteManyProps<TData, TError, TParams>,
	context?: UseDeleteManyContext,
): UseDeleteManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const mutationFn = DeleteMany.createMutationFn({
		fetchers,
		notify,
		translate,
		getProps,
	})
	const handleMutate = DeleteMany.createMutateHandler({
		queryClient,
		notify,
		translate,
		getProps,
		onMutate: (...args) => unref(props?.mutationOptions)?.onMutate?.(...args),
	})
	const handleSettled = DeleteMany.createSettledHandler({
		queryClient,
		getProps,
		onSettled: (...args) => unref(props?.mutationOptions)?.onSettled?.(...args),
	})
	const handleSuccess = DeleteMany.createSuccessHandler({
		queryClient,
		notify,
		translate,
		publish,
		getProps,
		onSuccess: (...args) => unref(props?.mutationOptions)?.onSuccess?.(...args),
	})
	const handleError = DeleteMany.createErrorHandler({
		queryClient,
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => unref(props?.mutationOptions)?.onError?.(...args),
	})

	const mutation = useMutation<DeleteManyResult<TData>, TError, DeleteMany.MutationProps<TData, TError, TParams>, DeleteMany.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions),
		mutationFn,
		onMutate: handleMutate,
		onSettled: handleSettled,
		onSuccess: handleSuccess,
		onError: handleError,
	})), queryClient)

	const mutate = DeleteMany.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = DeleteMany.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}

	function getProps(): DeleteMany.Props<TData, TError, TParams> | undefined {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
