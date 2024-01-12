import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { type MaybeRef, computedEager, toValue } from '@vueuse/shared'
import type { QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { Permissions } from '@ginjou/core'
import { type UseAuthContextFromProps, useAuthContext } from './auth'

export interface UsePermissionsProps<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
> {
	params?: MaybeRef<TParams | undefined>
	queryOptions?: MaybeRef<
		| Omit<
				QueryObserverOptions<TData, TError>,
				| 'queryFn'
				| 'queryKey'
			>
		| undefined
	>
}

export type UserPermissionsContext = Simplify<
	& UseAuthContextFromProps
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
	const auth = useAuthContext({ ...context, strict: true })
	function getParams(): TParams | undefined {
		return unref(props?.params)
	}

	return useQuery<TData, TError>(computed(() => ({
		...unref(props?.queryOptions),
		queryKey: computed(() => Permissions.createQueryKey<TParams>(getParams())),
		queryFn: Permissions.createQueryFn<TData, TParams>({
			auth,
			getParams,
		}),
		enabled: computedEager(() => Permissions.getQueryEnabled({
			auth,
			enabled: toValue(unref(unref(props?.queryOptions)?.enabled)),
		})),
	})))
}
