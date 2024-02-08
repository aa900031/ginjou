import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { AuthCheckResult } from '@ginjou/core'
import { CheckAuth } from '@ginjou/core'
import { computedEager, toValue } from '@vueuse/shared'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseQueryClientContextProps } from '../query'
import { useQueryClientContext } from '../query'
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
	& UseQueryClientContextProps
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

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	const queryKey = computed(() => CheckAuth.createQueryKey<TParams>(getParams()))
	const queryFn = CheckAuth.createQueryFn<TParams>({
		auth,
		getParams,
	})
	const isEnabled = computedEager(() => CheckAuth.getQueryEnabled({
		enabled: toValue(unref(unref(props?.queryOptions)?.enabled)),
		auth,
	}))

	return useQuery<AuthCheckResult, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey,
		queryFn,
		enabled: isEnabled,
		retry: false,
		queryClient,
	})))
}
