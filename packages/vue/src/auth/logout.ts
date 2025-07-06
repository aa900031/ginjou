import type { AuthLogoutResult } from '@ginjou/core'
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
import { unref } from 'vue-demi'
import { useTranslate } from '../i18n'
import { useNotify } from '../notification'
import { useQueryClientContext } from '../query/query-client'
import { useGo } from '../router'
import { unrefs } from '../utils/unrefs'
import { useAuthContext } from './auth'

export type UseLogoutProps<
	TParams,
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
	TParams,
	TError,
> = OverrideProperties<
	UseMutationReturnType<
		AuthLogoutResult,
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
	TParams = unknown,
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

	const mutation = useMutation<AuthLogoutResult, TError, TParams>({
		mutationKey: Logout.createMutationKey(),
		mutationFn: Logout.createMutationFn({
			auth,
		}),
		onSuccess: Logout.createSuccessHandler({
			queryClient,
			go,
			getProps,
		}),
		onError: Logout.createErrorHandler({
			notify,
			translate,
			go,
		}),
		...unref(props?.mutationOptions),
	}, queryClient)

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

	function getProps() {
		return props
			? unrefs(props) as any // TODO:
			: undefined
	}
}
