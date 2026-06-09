import type { GetPermissionsResult } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { MaybeAccessor } from '../utils'
import type { UseAuthzContextFromProps } from './authz'
import { Permissions } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useQueryClientContext } from '../query'
import { extract } from '../utils'
import { useAuthzContext } from './authz'

export type UsePermissionsProps<
	TData,
	TParams,
	TError,
> = MaybeAccessor<
	Permissions.Props<TData, TParams, TError> | undefined
>

export type UsePermissionsContext = Simplify<
	& UseAuthzContextFromProps
	& UseQueryClientContextProps
>

export type UsePermissionsResult<
	TData,
	TError,
> = CreateQueryResult<
	GetPermissionsResult<TData>,
	TError
>

export function usePermissions<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props?: UsePermissionsProps<TData, TParams, TError>,
	context?: UsePermissionsContext,
): UsePermissionsResult<TData, TError> {
	const authz = useAuthzContext(context)
	const queryClient = useQueryClientContext(context)

	const resolvedProps = $derived(extract(props))
	const queryKey = $derived(Permissions.createQueryKey<TParams>(resolvedProps?.params))
	const queryFn = Permissions.createQueryFn<TData, TParams>({
		authz,
		getParams: () => resolvedProps?.params,
	})
	const enabledFn = $derived.by(() => {
		const queryOptions = resolvedProps?.queryOptions
		return Permissions.createQueryEnabledFn({
			getAuthz: () => authz,
			getEnabled: () => queryOptions?.enabled,
		})
	})

	const query = createQuery<GetPermissionsResult<TData>, TError>(
		() => ({
			...resolvedProps?.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
		}),
		() => queryClient,
	)

	const handleSuccess: NonNullable<Permissions.QueryOptions<TData, TError>['onSuccess']> = (...args) =>
		resolvedProps?.queryOptions?.onSuccess?.(...args)
	const handleError: NonNullable<Permissions.QueryOptions<TData, TError>['onError']> = (...args) =>
		resolvedProps?.queryOptions?.onError?.(...args)

	useQueryCallbacks<GetPermissionsResult<TData>, TError>(() => ({
		queryKey,
		queryClient,
		onSuccess: handleSuccess,
		onError: handleError,
	}))

	return query
}
