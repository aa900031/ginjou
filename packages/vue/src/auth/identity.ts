import type { BaseRecord, Params } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthContextFromProps } from './auth'
import { Identity } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { useQueryCallbacks } from 'tanstack-query-callbacks/vue'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useAuthContext } from './auth'

export type UseGetIdentityProps<
	TData extends BaseRecord,
	TParams extends Params,
	TError,
> = ToMaybeRefs<
	Identity.Props<TData, TParams, TError>
>

export type UseGetIdentityContext = Simplify<
	& UseAuthContextFromProps
	& UseQueryClientContextProps
>

export type UseGetIdentityResult<
	TData extends BaseRecord,
	TError,
> = UseQueryReturnType<
	TData,
	TError
>

export function useGetIdentity<
	TData extends BaseRecord = BaseRecord,
	TParams extends Params = Params,
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
	const enabledFn = Identity.createQueryEnabledFn({
		getEnabled: () => unref(props?.queryOptions)?.enabled,
		getAuth: () => auth,
	})
	const query = useQuery<TData, TError>(
		computed(() => ({
			// FIXME: type
			...unref(props?.queryOptions) as any,
			queryKey,
			queryFn,
			enabled: () => enabledFn,
		})),
		queryClient,
	)
	useQueryCallbacks<TData, TError>({
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
