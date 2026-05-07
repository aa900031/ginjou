import type { LogoutResult, Params } from '@ginjou/core'
import type { CreateMutationResult } from '@tanstack/svelte-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseGoContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseAuthContextFromProps } from './auth'
import { Logout } from '@ginjou/core'
import { createMutation } from '@tanstack/svelte-query'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
import { useGo } from '../router'
import { extract, withAccessors } from '../utils'
import { useAuthContext } from './auth'

export type UseLogoutProps<
	TParams extends Params,
	TError,
> = MaybeAccessor<
	Logout.Props<TParams, TError> | undefined
>

export type UseLogoutContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
	& UseGoContext
	& UseNotifyContext
	& UseTranslateContext
>

export type UseLogoutResult<
	TParams extends Params,
	TError,
> = OverrideProperties<
	CreateMutationResult<
		LogoutResult,
		TError,
		TParams,
		unknown
	>,
	{
		mutate: Logout.MutateFn<TParams, TError>
		mutateAsync: Logout.MutateAsyncFn<TParams, TError>
	}
>

export function useLogout<
	TParams extends Params = Params,
	TError = unknown,
>(
	props?: UseLogoutProps<TParams, TError>,
	context?: UseLogoutContext,
): UseLogoutResult<TParams, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)
	const notify = useNotify(context)
	const translate = useTranslate(context)

	const resolvedProps = $derived(extract(props))
	const mutationKey = Logout.createMutationKey()
	const mutationFn = Logout.createMutationFn<TParams>({
		auth,
	})
	const handleSuccess = Logout.createSuccessHandler<TParams, TError>({
		queryClient,
		go,
		getProps: () => resolvedProps,
		onSuccess: (...args) => resolvedProps?.mutationOptions?.onSuccess?.(...args),
	})
	const handleError = Logout.createErrorHandler<TParams, TError>({
		notify,
		translate,
		go,
		onError: (...args) => resolvedProps?.mutationOptions?.onError?.(...args),
	})

	const mutation = createMutation<LogoutResult, TError, TParams>(
		() => ({
			...resolvedProps?.mutationOptions,
			mutationKey,
			mutationFn,
			onSuccess: handleSuccess,
			onError: handleError,
		}),
		() => queryClient,
	)

	const mutate = Logout.createMutateFn({
		originFn: mutation.mutate,
	})
	const mutateAsync = Logout.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return withAccessors(mutation, {
		mutate: () => mutate,
		mutateAsync: () => mutateAsync,
	})
}
