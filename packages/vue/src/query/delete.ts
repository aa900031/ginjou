import type { BaseRecord, DeleteOneResult, Params } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { DeleteOne } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { unrefs } from '../utils/unrefs'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseDeleteOneProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = ToMaybeRefs<
	DeleteOne.Props<TData, TError, TParams>
>

export type UseDeleteOneContext = Simplify<
	& UseFetcherContextFromProps
	& UseQueryClientContextProps
	& UseNotifyContext
	& UseTranslateContext
	& UseCheckErrorContext
	& UsePublishContext
>

export type UseDeleteOneResult<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = OverrideProperties<
	UseMutationReturnType<
		DeleteOneResult<TData>,
		TError,
		DeleteOne.MutationProps<TData, TError, TParams>,
		DeleteOne.MutationContext<TData>
	>,
	{
		mutate: DeleteOne.MutateFn<TData, TError, TParams>
		mutateAsync: DeleteOne.MutateAsyncFn<TData, TError, TParams>
	}
>

export function useDeleteOne<
	TData extends BaseRecord = BaseRecord,
	TParams extends Params = TData,
	TError = unknown,
>(
	props?: UseDeleteOneProps<TData, TError, TParams>,
	context?: UseDeleteOneContext,
): UseDeleteOneResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError<TError>(undefined, context)

	const mutationFn = DeleteOne.createMutationFn({
		fetchers,
		notify,
		translate,
		getProps,
	})
	const handleMutate = DeleteOne.createMutateHandler({
		queryClient,
		notify,
		translate,
		getProps,
		onMutate: (...args) => unref(props?.mutationOptions)?.onMutate?.(...args),
	})
	const handleSettled = DeleteOne.createSettledHandler<TData, TError, TParams>({
		queryClient,
		getProps,
		onSettled: (...args) => unref(props?.mutationOptions)?.onSettled?.(...args),
	})
	const handleSuccess = DeleteOne.createSuccessHandler({
		queryClient,
		notify,
		translate,
		publish,
		getProps,
		onSuccess: (...args) => unref(props?.mutationOptions)?.onSuccess?.(...args),
	})
	const handleError = DeleteOne.createErrorHandler({
		queryClient,
		notify,
		translate,
		checkError,
		getProps,
		onError: (...args) => unref(props?.mutationOptions)?.onError?.(...args),
	})

	const mutation = useMutation<DeleteOneResult<TData>, TError, DeleteOne.MutationProps<TData, TError, TParams>, DeleteOne.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions),
		mutationFn,
		onMutate: handleMutate,
		onSettled: handleSettled,
		onSuccess: handleSuccess,
		onError: handleError,
	})), queryClient)

	const mutate = DeleteOne.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = DeleteOne.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}

	function getProps(): DeleteOne.Props<TData, TError, TParams> | undefined {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
