import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import type { QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { AuthCheckResult } from '@ginjou/core'
import { CheckAuth } from '@ginjou/core'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export interface UseAuthenticatedProps<
	TParams,
	TError,
> {
	params?: MaybeRef<TParams | undefined>
	queryOptions?: MaybeRef<
			| Omit<
					QueryObserverOptions<AuthCheckResult, TError>,
					| 'queryFn'
					| 'queryKey'
					| 'retry'
				>
			| undefined
		>
}

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

	return useQuery<AuthCheckResult, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey: computed(() => CheckAuth.createQueryKey<TParams>(getParams())),
		queryFn: CheckAuth.createQueryFn<TParams>({
			auth,
			getParams,
		}),
		retry: false,
	})))
}
