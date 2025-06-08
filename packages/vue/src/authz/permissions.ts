import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthzContextFromProps } from './authz'
import { Permissions } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useAuthzContext } from './authz'

export type UsePermissionsProps<
	TData,
	TParams,
	TError,
> = ToMaybeRefs<
	Permissions.Props<TData, TParams, TError>
>

export type UserPermissionsContext = Simplify<
	& UseAuthzContextFromProps
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
	const authz = useAuthzContext(context)
	const queryClient = useQueryClientContext(context)
	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	const queryKey = computed(() => Permissions.createQueryKey<TParams>(getParams()))
	const queryFn = Permissions.createQueryFn<TData, TParams>({
		authz,
		getParams,
	})
	const isEnabled = computed(() => Permissions.getQueryEnabled({
		authz,
		enabled: unref(props?.queryOptions)?.enabled,
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
}
