import type { AccessCanParams, AccessCanResult } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { MaybeAccessor } from '../utils'
import type { UseAuthzContextFromProps } from './authz'
import { CanAccess } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useQueryClientContext } from '../query'
import { extract } from '../utils'
import { useAuthzContext } from './authz'

export type UseCanAccessProps<
	TError,
> = MaybeAccessor<
	CanAccess.Props<TError>
>

export type UseCanAccessContext = Simplify<
	& UseAuthzContextFromProps
	& UseQueryClientContextProps
>

export type UseCanAccessResult<
	TError,
> = CreateQueryResult<
	AccessCanResult,
	TError
>

export function useCanAccess<
	TError = unknown,
>(
	props: UseCanAccessProps<TError>,
	context?: UseCanAccessContext,
): UseCanAccessResult<TError> {
	const authz = useAuthzContext({ ...context, strict: true })
	const queryClient = useQueryClientContext(context)

	const resolvedProps = $derived(extract(props))
	const params = $derived.by((): AccessCanParams => ({
		action: resolvedProps.action,
		resource: resolvedProps.resource,
		params: resolvedProps.params,
		meta: resolvedProps.meta,
	}))
	const queryKey = $derived(CanAccess.createQueryKey({ params }))
	const queryFn = CanAccess.createQueryFn({
		authz,
		getParams: () => params,
	})
	const enabledFn = $derived.by(() => {
		const queryOptions = resolvedProps.queryOptions
		return CanAccess.createQueryEnabledFn({
			getAuthz: () => authz,
			getEnabled: () => queryOptions?.enabled,
		})
	})

	const query = createQuery<AccessCanResult, TError>(
		() => ({
			...resolvedProps.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
			retry: false,
		}),
		() => queryClient,
	)

	const handleSuccess: NonNullable<CanAccess.QueryOptions<TError>['onSuccess']> = (...args) =>
		resolvedProps.queryOptions?.onSuccess?.(...args)
	const handleError: NonNullable<CanAccess.QueryOptions<TError>['onError']> = (...args) =>
		resolvedProps.queryOptions?.onError?.(...args)

	useQueryCallbacks<AccessCanResult, TError>(() => ({
		queryKey,
		queryClient,
		onSuccess: handleSuccess,
		onError: handleError,
	}))

	return query
}
