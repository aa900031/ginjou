import type { BaseRecord, DeleteManyResult } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { MaybeRef } from '@vueuse/shared'
import type { Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { DeleteMany } from '@ginjou/core'
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

export type UseDeleteManyProps<
	TData extends BaseRecord,
	TError,
	TParams,
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
	TParams,
> = UseMutationReturnType<
	DeleteManyResult<TData>,
	TError,
	DeleteMany.MutationProps<TData, TError, TParams>,
	DeleteMany.MutationContext<TData>
>

export function useDeleteMany<
	TData extends BaseRecord,
	TError,
	TParams,
>(
	props?: UseDeleteManyProps<TData, TError, TParams>,
	context?: UseDeleteManyContext,
): UseDeleteManyResult<TData, TError, TParams> {
	const queryClient = useQueryClientContext(context)
	const fetchers = useFetchersContext({ ...context, strict: true })
	const notify = useNotify(context)
	const translate = useTranslate(context)
	const publish = usePublish(context)
	const { mutateAsync: checkError } = useCheckError(context)

	const mutation = useMutation<DeleteManyResult<TData>, TError, DeleteMany.MutationProps<TData, TError, TParams>, DeleteMany.MutationContext<TData>>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: DeleteMany.createMutationFn({
			fetchers,
			notify,
			translate,
			getProps,
		}),
		onMutate: DeleteMany.createMutateHandler({
			queryClient,
			notify,
			translate,
			getProps,
			onMutate: unref(props?.mutationOptions)?.onMutate,
		}),
		onSettled: DeleteMany.createSettledHandler({
			queryClient,
			getProps,
			onSettled: unref(props?.mutationOptions)?.onSettled,
		}),
		onSuccess: DeleteMany.createSuccessHandler({
			queryClient,
			notify,
			translate,
			publish,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: DeleteMany.createErrorHandler({
			queryClient,
			notify,
			translate,
			checkError,
			getProps,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

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

	function getProps() {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
