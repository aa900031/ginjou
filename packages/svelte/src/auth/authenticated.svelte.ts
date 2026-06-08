import type { CheckAuthResult, Params } from '@ginjou/core'
import type { CreateQueryResult } from '@tanstack/svelte-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { UseGoContext } from '../router'
import type { MaybeAccessor } from '../utils'
import type { UseAuthContextFromProps } from './auth'
import { CheckAuth } from '@ginjou/core'
import { createQuery } from '@tanstack/svelte-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/svelte'
import { useQueryClientContext } from '../query'
import { extract } from '../utils'
import { useAuthContext } from './auth'

export type UseAuthenticatedProps<
	TParams extends Params,
	TError,
> = MaybeAccessor<
	CheckAuth.Props<TParams, TError> | undefined
>

export type UseAuthenticatedContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
	& UseGoContext
>

export type UseAuthenticatedResult<
	TError,
> = Simplify<
	& CreateQueryResult<CheckAuthResult, TError>
>

export function useAuthenticated<
	TParams extends Params = Params,
	TError = unknown,
>(
	props?: UseAuthenticatedProps<TParams, TError>,
	context?: UseAuthenticatedContext,
): UseAuthenticatedResult<TError> {
	const auth = useAuthContext(context)
	const queryClient = useQueryClientContext(context)

	const resolvedProps = $derived(extract(props))
	const queryKey = $derived(
		CheckAuth.createQueryKey<TParams>(resolvedProps?.params),
	)
	const queryFn = CheckAuth.createQueryFn<TParams>({
		auth,
		getParams: () => resolvedProps?.params,
	})
	const enabledFn = $derived.by(() => {
		const queryOptions = resolvedProps?.queryOptions
		return CheckAuth.createQueryEnabledFn({
			getEnabled: () => queryOptions?.enabled,
			getAuth: () => auth,
		})
	})

	const query = createQuery<CheckAuthResult, TError>(
		() => ({
			...resolvedProps?.queryOptions,
			queryKey,
			queryFn,
			enabled: enabledFn,
			retry: false,
		}),
		() => queryClient,
	)

	const handleSuccess: NonNullable<CheckAuth.QueryOptions<TError>['onSuccess']> = (...args) =>
		resolvedProps?.queryOptions?.onSuccess?.(...args)
	const handleError: NonNullable<CheckAuth.QueryOptions<TError>['onError']> = (...args) =>
		resolvedProps?.queryOptions?.onError?.(...args)

	useQueryCallbacks<CheckAuthResult, TError>(() => ({
		queryKey,
		queryClient,
		onSuccess: handleSuccess,
		onError: handleError,
	}))

	return query
}
