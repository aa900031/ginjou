import type { AccessCanParams, AccessCanResult } from '@ginjou/core'
import type { UseQueryReturnType } from '@tanstack/vue-query'
import type { Simplify } from 'type-fest'
import type { UseQueryClientContextProps } from '../query'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAccessContextFromProps } from './access'
import { CanAccess } from '@ginjou/core'
import { useQuery } from '@tanstack/vue-query'
import { computed, unref } from 'vue-demi'
import { useQueryClientContext } from '../query'
import { useAccessContext } from './access'

export type UseCanAccessProps<
	TError,
> = ToMaybeRefs<
	CanAccess.Props<TError>
>

export type UseCanAccessContext = Simplify<
	& UseAccessContextFromProps
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
	const access = useAccessContext({ ...context, strict: true })
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
	const queryFn = CanAccess.createQueryFn<TError>({
		access,
		getParams: () => unref(params),
	})
	const isEnabled = computed(() => CanAccess.getQueryEnabled({
		enabled: unref(props.queryOptions)?.enabled,
		access,
	}))

	return useQuery<AccessCanResult, TError>(
		computed(() => ({
			...unref(props.queryOptions),
			queryKey,
			queryFn,
			enabled: isEnabled,
			retry: false,
		})),
		queryClient,
	)
}
