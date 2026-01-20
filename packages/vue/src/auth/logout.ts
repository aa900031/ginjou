import type { LogoutResult, Params } from '@ginjou/core'
import type { UseMutationReturnType } from '@tanstack/vue-query'
import type { OverrideProperties, Simplify } from 'type-fest'
import type { UseTranslateContext } from '../i18n'
import type { UseNotifyContext } from '../notification'
import type { UseQueryClientContextProps } from '../query/query-client'
import type { UseGoContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { Logout } from '@ginjou/core'
import { useMutation } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
import { useGo } from '../router'
import { unrefs } from '../utils/unrefs'
import { useAuthContext } from './auth'

export type UseLogoutProps<
	TParams extends Params,
	TError,
> = ToMaybeRefs<
	& Logout.Props<TParams, TError>
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
	UseMutationReturnType<
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

	const mutation = useMutation<LogoutResult, TError, TParams>(computed(() => ({
		...unref(props?.mutationOptions),
		mutationKey: Logout.createMutationKey(),
		mutationFn: Logout.createMutationFn({
			auth,
		}),
		onSuccess: Logout.createSuccessHandler({
			queryClient,
			go,
			getProps,
			onSuccess: unref(props?.mutationOptions)?.onSuccess,
		}),
		onError: Logout.createErrorHandler({
			notify,
			translate,
			go,
			onError: unref(props?.mutationOptions)?.onError,
		}),
	})), queryClient)

	const mutate = Logout.createMutateFn({
		originFn: mutation.mutate,
	})

	const mutateAsync = Logout.createMutateAsyncFn({
		originFn: mutation.mutateAsync,
	})

	return {
		...mutation,
		mutate,
		mutateAsync,
	}

	function getProps(): Logout.Props<TParams, TError> | undefined {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
