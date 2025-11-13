import type { AuthCheckResult } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { CheckAuth } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
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

	const queryKey = computed(() => CheckAuth.createQueryKey<TParams>(
		getParams(),
	))
	const queryFn = CheckAuth.createQueryFn<TParams>({
		auth,
		getParams,
	})
	const enabledFn = CheckAuth.createQueryEnabledFn({
		getEnabled: () => unref(props?.queryOptions)?.enabled,
		getAuth: () => auth,
	})
	const query = useQuery<AuthCheckResult, TError>(
		computed(() => ({
			...unref(props?.queryOptions),
			queryKey,
			queryFn,
			enabled: () => enabledFn,
			retry: false,
		})),
		queryClient,
	)
	useQueryCallbacks<AuthCheckResult, TError>({
		queryKey,
		queryClient,
		onSuccess: (...args) => unref(props?.queryOptions)?.onSuccess?.(...args),
		onError: (...args) => unref(props?.queryOptions)?.onError?.(...args),
	})

	return query

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}
}
