import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { type MaybeRef, computedEager, toValue } from '@vueuse/shared'
import type { UseQueryOptions } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { checkPermissionsEnabled, createPermissionsQueryFn, genPermissionsQueryKey } from '@ginjou/auth'
import { type UseAuthContextFromProps, useAuthContext } from './auth'

export interface UsePermissionsProps<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
> {
	params?: MaybeRef<TParams | undefined>
	queryOptions?: MaybeRef<
		| UseQueryOptions<TData, TError>
		| undefined
	>
}

export type UserPermissionsContext = Simplify<
	& UseAuthContextFromProps
>

export function usePermissions<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props: UsePermissionsProps<TData, TParams, TError>,
	context?: UserPermissionsContext,
) {
	const auth = useAuthContext({ ...context, strict: true })
	function getParams() {
		return unref(props.params)
	}

	return useQuery({
		queryKey: computed(() => genPermissionsQueryKey(getParams())),
		queryFn: createPermissionsQueryFn<TData, TParams>({
			auth,
			getParams,
		}),
		enabled: computedEager(() =>
			toValue(unref(unref(props.queryOptions)?.enabled))
			?? checkPermissionsEnabled({
				auth,
			}),
		),
	})
}
