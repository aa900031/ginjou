import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import { Permissions } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { computedEager, toValue } from '@vueuse/shared'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useAuthContext, type UseAuthContextFromProps } from './auth'

export type UsePermissionsProps<
	TData,
	TParams,
	TError,
> = ToMaybeRefs<
	Permissions.Props<TData, TParams, TError>
>

export type UserPermissionsContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
>

export type UsePermissionsResult<
	TData,
	TError,
> = UseQueryReturnType<
	TData,
	TError
>

export function usePermissions<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props?: UsePermissionsProps<TData, TParams, TError>,
	context?: UserPermissionsContext,
): UsePermissionsResult<TData, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)
	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	const queryKey = computed(() => Permissions.createQueryKey<TParams>(getParams()))
	const queryFn = Permissions.createQueryFn<TData, TParams>({
		auth,
		getParams,
	})
	const isEnabled = computedEager(() => Permissions.getQueryEnabled({
		auth,
		enabled: toValue(unref(unref(props?.queryOptions)?.enabled)),
	}))

	return useQuery<TData, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey,
		queryFn,
		enabled: isEnabled,
		queryClient,
	})))
}
