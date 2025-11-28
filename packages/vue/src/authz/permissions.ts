import type { GetPermissionsResult } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthzContextFromProps } from './authz'
import { Permissions } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
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
	GetPermissionsResult<TData>,
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
	const queryKey = computed(() => Permissions.createQueryKey<TParams>(getParams()))
	const queryFn = Permissions.createQueryFn<TData, TParams>({
		authz,
		getParams,
	})
	const enabledFn = Permissions.createQueryEnabledFn({
		getAuthz: () => authz,
		getEnabled: () => unref(props?.queryOptions)?.enabled,
	})
	const query = useQuery<GetPermissionsResult<TData>, TError>(
		computed(() => ({
			// FIXME: type
			...unref(props?.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: () => enabledFn,
		})),
		queryClient,
	)
	useQueryCallbacks<GetPermissionsResult<TData>, TError>({
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
