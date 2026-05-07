import type { LoginResult, Params } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseGoContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseAuthContextFromProps } from './auth'
import { Login } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
import { useGo } from '../router'
import { extract } from '../utils'
import { useAuthContext } from './auth'

export type UseLoginProps<
	TParams extends Params,
	TError,
> = MaybeAccessor<
	Login.Props<TParams, TError> | undefined
>

export type UseLoginContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
	& UseGoContext
	& UseNotifyContext
	& UseTranslateContext
>

export type UseLoginResult<
	TParams extends Params,
	TError,
> = OverrideProperties<
	CreateMutationResult<
		LoginResult,
		TError,
		TParams,
		unknown
	>,
	{
		mutate: Login.MutateFn<TParams, TError>
		mutateAsync: Login.MutateAsyncFn<TParams, TError>
	}
>

export function useLogin<
	TParams extends Params = Params,
	TError = unknown,
>(
	props?: UseLoginProps<TParams, TError>,
	context?: UseLoginContext,
): UseLoginResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const notify = useNotify(context)
	const translate = useTranslate(context)

	const resolvedProps = $derived(extract(props))
	const mutationKey = Login.createMutationKey()
	const mutationFn = Login.createMutationFn<TParams>({
		auth,
	})
	const handleSuccess = Login.createSuccessHandler<TParams, TError>({
		queryClient,
		go,
		getProps: () => resolvedProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})
	const handleError = Login.createErrorHandler<TParams, TError>({
		notify,
		translate,
		go,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<LoginResult, TError, TParams>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationKey,
			mutationFn,
			onSuccess: handleSuccess,
			onError: handleError,
		}),
		() => queryClient,
	)

	const mutate = Login.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = Login.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return Object.assign(mutation, {
		mutate,
		mutateAsync,
	})
}
