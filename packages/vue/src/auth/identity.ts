import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { Identity } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useAuthContext } from './auth'

export type UseGetIdentityProps<
	TData,
	TParams,
	TError,
> = ToMaybeRefs<
	Identity.Props<TData, TParams, TError>
>

export type UseGetIdentityContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
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
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)

	const queryKey = computed(() => Identity.createQueryKey<TParams>(getParams()))
	const queryFn = Identity.createQueryFn<TData, TParams>({
		auth,
		getParams,
	})
	const isEnabled = computed(() => Identity.getQueryEnabled({
		enabled: unref(props?.queryOptions)?.enabled,
		auth,
	}))

	return useQuery<TData, TError>(
		computed(() => ({
			// FIXME: type
			...unref(props?.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: isEnabled,
		})),
		queryClient,
	)

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}
}
