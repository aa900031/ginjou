import type { BaseRecord, CreateManyResult, Params } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CreateMany } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { unrefs } from '../utils/unrefs'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCreateManyProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = ToMaybeRefs<
	CreateMany.Props<TData, TError, TParams>
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
	UseMutationReturnType<
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

	const mutation = useMutation<CreateManyResult<TData>, TError, CreateMany.MutationProps<TData, TError, TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CreateMany.createMutationFn({
			fetchers,
			getProps,
		}),
		onSuccess: CreateMany.createSuccessHandler({
			notify,
			translate,
			publish,
			queryClient,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: CreateMany.createErrorHandler({
			notify,
			translate,
			checkError,
			getProps,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	const mutate = CreateMany.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = CreateMany.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}

	function getProps() {
		return props
			? unrefs(props) as any
			: undefined
	}
}
