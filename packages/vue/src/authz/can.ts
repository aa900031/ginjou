import type { AccessCanParams, AccessCanResult } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAuthzContextFromProps } from './authz'
import { CanAccess } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useAuthzContext } from './authz'

export type UseCanAccessProps<
	TError,
> = ToMaybeRefs<
	CanAccess.Props<TError>
>

export type UseCanAccessContext = Simplify<
	& UseAuthzContextFromProps
	& UseQueryClientContextProps
>

export type UseCanAccessResult<
	TError,
> = Simplify<
	& UseQueryReturnType<AccessCanResult, TError>
>

export function useCanAccess<
	TError = unknown,
>(
	props: UseCanAccessProps<TError>,
	context?: UseCanAccessContext,
): UseCanAccessResult<TError> {
	const authz = useAuthzContext({ ...context, strict: true })
	const queryClient = useQueryClientContext(context)

	const params = computed<AccessCanParams>(() => {
		return {
			action: unref(props.action),
			resource: unref(props.resource),
			params: unref(props.params),
			meta: unref(props.meta),
		}
	})

	const queryKey = computed(() => CanAccess.createQueryKey({
		params: unref(params),
	}))
	const queryFn = CanAccess.createQueryFn({
		authz,
		getParams: () => unref(params),
	})
	const enabledFn = CanAccess.createQueryEnabledFn({
		getAuthz: () => authz,
		getEnabled: () => unref(props.queryOptions)?.enabled,
	})

	return useQuery<AccessCanResult, TError>(
		computed(() => ({
			...unref(props.queryOptions),
			queryKey,
			queryFn,
			enabled: () => enabledFn,
			retry: false,
		})),
		queryClient,
	)
}
