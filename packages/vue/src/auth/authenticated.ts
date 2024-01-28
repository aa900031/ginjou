import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { AuthCheckResult } from '@ginjou/core'
import { CheckAuth } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export type UseAuthenticatedProps<
	TParams,
	TError,
> = ToMaybeRefs<
	CheckAuth.Props<TParams, TError>
>

export type UseAuthenticatedContext = Simplify<
	& UseAuthContextFromProps
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
	const auth = useAuthContext({ ...context, strict: true })

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	const queryKey = computed(() => CheckAuth.createQueryKey<TParams>(getParams()))
	const queryFn = CheckAuth.createQueryFn<TParams>({
		auth,
		getParams,
	})

	return useQuery<AuthCheckResult, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey,
		queryFn,
		retry: false,
	})))
}
