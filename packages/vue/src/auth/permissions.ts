import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { computedEager, toValue } from '@vueuse/shared'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { Permissions } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseQueryClientContextProps } from '../query'
import { useQueryClientContext } from '../query'
import { type UseAuthContextFromProps, useAuthContext } from './auth'

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
