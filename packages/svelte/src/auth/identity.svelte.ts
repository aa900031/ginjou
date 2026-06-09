import type { GetIdentityResult, Params } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { MaybeAccessor } from '../utils'
import type { UseAuthContextFromProps } from './auth'
import { Identity } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useQueryClientContext } from '../query'
import { extract } from '../utils'
import { useAuthContext } from './auth'

export type UseGetIdentityProps<
	TData,
	TParams extends Params,
	TError,
> = MaybeAccessor<
	Identity.Props<TData, TParams, TError> | undefined
>

export type UseGetIdentityContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
>

export type UseGetIdentityResult<
	TData,
	TError,
> = CreateQueryResult<
	GetIdentityResult<TData>,
	TError
>

export function useGetIdentity<
	TData = unknown,
	TParams extends Params = Params,
	TError = unknown,
>(
	props?: UseGetIdentityProps<TData, TParams, TError>,
	context?: UseGetIdentityContext,
): UseGetIdentityResult<TData, TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)

	const resolvedProps = $derived(extract(props))
	const queryKey = $derived(Identity.createQueryKey<TParams>(resolvedProps?.params))
	const queryFn = Identity.createQueryFn<TData, TParams>({
		auth,
		getParams: () => resolvedProps?.params,
	})
	const enabledFn = $derived.by(() => {
		const queryOptions = resolvedProps?.queryOptions
		return Identity.createQueryEnabledFn({
			getEnabled: () => queryOptions?.enabled,
			getAuth: () => auth,
		})
	})

	const query = createQuery<GetIdentityResult<TData>, TError>(
		() => ({
			...resolvedProps?.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
		}),
		() => queryClient,
	)

	const handleSuccess: NonNullable<Identity.QueryOptions<TData, TError>['onSuccess']> = (...args) =>
		resolvedProps?.queryOptions?.onSuccess?.(...args)
	const handleError: NonNullable<Identity.QueryOptions<TData, TError>['onError']> = (...args) =>
		resolvedProps?.queryOptions?.onError?.(...args)

	useQueryCallbacks<GetIdentityResult<TData>, TError>(() => ({
		queryKey,
		queryClient,
		onSuccess: handleSuccess,
		onError: handleError,
	}))

	return query
}
