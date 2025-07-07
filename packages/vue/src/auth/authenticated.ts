import type { AuthCheckResult } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { CheckAuth } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useGo } from '../router'
import { useAuthContext } from './auth'

export type UseAuthenticatedProps<
	TParams,
	TError,
> = ToMaybeRefs<
	CheckAuth.Props<TParams, TError>
>

export type UseAuthenticatedContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
	& UseGoContext
>

export type UseAuthenticatedResult<
	TError,
> = Simplify<
	& UseQueryReturnType<AuthCheckResult, TError>
>

export function useAuthenticated<
	TParams = unknown,
	TError = unknown,
>(
	props?: UseAuthenticatedProps<TParams, TError>,
	context?: UseAuthenticatedContext,
): UseAuthenticatedResult<TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	const go = useGo(context)

	const queryKey = computed(() => CheckAuth.createQueryKey<TParams>(
		getParams(),
	))
	const queryFn = CheckAuth.createQueryFn<TParams, TError>({
		auth,
		getParams,
	})
	const isEnabled = computed(() => CheckAuth.getQueryEnabled({
		enabled: unref(props?.queryOptions)?.enabled,
		auth,
	}))
	const onError = CheckAuth.createErrorHandler<TParams, TError>({
		go,
		getRedirectTo,
		emitParent: (...args) => unref(props?.queryOptions)?.onError?.(...args),
	})

	return useQuery<AuthCheckResult, TError>(
		computed(() => ({
			...unref(props?.queryOptions),
			queryKey,
			queryFn,
			enabled: isEnabled,
			retry: false,
			onError,
		})),
		queryClient,
	)

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	function getRedirectTo() {
		return unref(props?.redirectTo)
	}
}
