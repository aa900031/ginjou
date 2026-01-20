import type { BaseRecord, CreateResult, Params } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseCheckErrorContext } from '../auth'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UsePublishContext } from '../realtime'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseFetcherContextFromProps } from './fetchers'
import type { UseQueryClientContextProps } from './query-client'
import { CreateOne } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useCheckError } from '../auth'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { usePublish } from '../realtime'
import { unrefs } from '../utils/unrefs'
import { useFetchersContext } from './fetchers'
import { useQueryClientContext } from './query-client'

export type UseCreateOneProps<
	TData extends BaseRecord,
	TError,
	TParams extends Params,
> = ToMaybeRefs<
	CreateOne.Props<TData, TError, TParams>
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
	UseMutationReturnType<
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

	const mutation = useMutation<CreateResult<TData>, TError, CreateOne.MutationProps<TData, TError, TParams>, any>(computed(() => ({
		...unref(props?.mutationOptions) as any, // TODO:
		mutationFn: CreateOne.createMutationFn<TData, TError, TParams>({
			fetchers,
			getProps,
		}),
		onSuccess: CreateOne.createSuccessHandler({
			notify,
			translate,
			publish,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
			queryClient,
		}),
		onError: CreateOne.createErrorHandler({
			notify,
			translate,
			checkError,
			getProps,
			onError: unref(props?.mutationOptions)?.onError,
		}),
		queryClient,
	})))

	const mutate = CreateOne.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = CreateOne.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}

	function getProps(): CreateOne.Props<TData, TError, TParams> | undefined {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
