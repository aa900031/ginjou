import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { computedEager, toValue } from '@vueuse/shared'
import type { QueryObserverOptions, UseQueryOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { Identity } from '@ginjou/core'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export interface UseGetIdentityProps<
	TData,
	TParams,
	TError,
> {
	params?: MaybeRef<TParams | undefined>
	queryOptions?: MaybeRef<
		| Omit<
				QueryObserverOptions<TData, TError>,
				| 'queryFn'
				| 'queryKey'
			>
		| undefined
	>
}

export type UseGetIdentityContext = Simplify<
	& UseAuthContextFromProps
>

export type UseGetIdentityResult<
	TData,
	TError,
> = UseQueryReturnType<
	TData,
	TError
>

export function useGetIdentity<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props?: UseGetIdentityProps<TData, TParams, TError>,
	context?: UseGetIdentityContext,
): UseGetIdentityResult<TData, TError> {
	const auth = useAuthContext({ ...context, strict: true })

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	return useQuery<TData, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey: computed(() => Identity.createQueryKey<TParams>(getParams())),
		queryFn: Identity.createQueryFn<TData, TParams>({
			auth,
			getParams,
		}),
		enabled: computedEager(() => Identity.getQueryEnabled({
			enabled: toValue(unref(unref(props?.queryOptions)?.enabled)),
			auth,
		})),
	})))
}
