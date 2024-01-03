import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { computedEager, toValue } from '@vueuse/shared'
import type { UseQueryOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import { checkGetIdentityQueryEnabled, createGetIdentityQueryFn, genGetIdentityQueryKey } from '@ginjou/core'
import type { UseAuthContextFromProps } from './auth'
import { useAuthContext } from './auth'

export interface UseGetIdentityProps<
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

export type UseGetIdentityContext = Simplify<
	& UseAuthContextFromProps
>

export type UseGetIdentityResult<
	TData = unknown,
	TError = unknown,
> = UseQueryReturnType<
	TData,
	TError
>

export function useGetIdentity<
	TData = unknown,
	TParams = unknown,
	TError = unknown,
>(
	props: UseGetIdentityProps<TData, TParams, TError>,
	context?: UseGetIdentityContext,
): UseGetIdentityResult<TData, TError> {
	const auth = useAuthContext({ ...context, strict: true })
	function getParams() {
		return unref(props.params)
	}

	return useQuery<TData, TError>({
		queryKey: computed(() => genGetIdentityQueryKey(getParams())),
		queryFn: createGetIdentityQueryFn<TData, TParams>({
			auth,
			getParams,
		}),
		enabled: computedEager(() =>
			toValue(unref(unref(props.queryOptions)?.enabled))
			?? checkGetIdentityQueryEnabled({
				auth,
			}),
		),
	})
}
