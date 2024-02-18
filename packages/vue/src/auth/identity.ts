import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { computedEager, toValue } from '@vueuse/shared'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { Identity } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseQueryClientContextProps } from '../query'
import { useQueryClientContext } from '../query'
import type { UseAuthContextFromProps } from './auth'
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

	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	const queryKey = computed(() => Identity.createQueryKey<TParams>(getParams()))
	const queryFn = Identity.createQueryFn<TData, TParams>({
		auth,
		getParams,
	})
	const isEnabled = computedEager(() => Identity.getQueryEnabled({
		enabled: toValue(unref(unref(props?.queryOptions)?.enabled)),
		auth,
	}))

	return useQuery<TData, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey,
		queryFn,
		enabled: isEnabled,
		queryClient,
	})))
}
