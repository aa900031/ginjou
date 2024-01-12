import type { Simplify } from 'type-fest'
import { computed, unref } from 'vue-demi'
import { type MaybeRef, toValue } from '@vueuse/shared'
import type { QueryObserverOptions, UseQueryReturnType } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { AccessCanParams, AccessCanResult } from '@ginjou/core'
import { CanAccess } from '@ginjou/core'
import type { ToMaybeRefs } from '../utils/refs'
import type { UseAccessContextFromProps } from './access'
import { useAccessContext } from './access'

export type UseCanAccessProps<
	TError,
> = Simplify<
	& ToMaybeRefs<AccessCanParams>
	& {
		queryOptions?: MaybeRef<
			| Omit<
					QueryObserverOptions<AccessCanResult, TError>,
					| 'queryFn'
					| 'queryKey'
					| 'retry'
				>
			| undefined
		>
	}
>

export type UseCanAccessContext = Simplify<
	& UseAccessContextFromProps
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

	const params = computed<AccessCanParams>(() => {
		return {
			action: unref(props.action),
			resource: unref(props.resource),
			params: unref(props.params),
			meta: unref(props.meta),
		}
	})

	return useQuery<AccessCanResult, TError>(computed(() => ({
		...unref(props.queryOptions),
		queryKey: computed(() => CanAccess.createQueryKey({
			params: unref(params),
		})),
		queryFn: CanAccess.createQueryFn<TError>({
			access,
			getParams: () => unref(params),
		}),
		enabled: computed(() => CanAccess.getQueryEnabled({
			enabled: toValue(unref(props.queryOptions)?.enabled),
			access,
		})),
		retry: false,
	})))
}
