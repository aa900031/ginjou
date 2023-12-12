import { computed, unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { useQuery } from '@tanstack/vue-query'
import { createCheckQueryFn, genCheckQueryKey } from '@ginjou/auth'
import { useAuthContext } from './auth'

export interface UseAuthenticatedProps<
	TParams = unknown,
> {
	params?: MaybeRef<TParams | undefined>
}

export function useAuthenticated<
	TParams = unknown,
>(
	props: UseAuthenticatedProps<TParams>,
) {
	const auth = useAuthContext({ strict: true })
	function getParams() {
		return unref(props.params)
	}

	return useQuery({
		queryKey: computed(() => genCheckQueryKey(getParams())),
		queryFn: createCheckQueryFn({
			auth,
			getParams,
		}),
		retry: false,
	})
}
