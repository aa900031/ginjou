import { shallowRef, watch } from 'vue-demi'
import type { Ref, ShallowRef } from 'vue-demi'

export function refFallback<T, TParams>(
	params: () => TParams,
	get: (params: TParams) => T,
): Ref<T> {
	const result = shallowRef<T>()

	watch(params, (val) => {
		result.value = get(val)
	}, {
		flush: 'sync',
		immediate: true,
	})

	return result as ShallowRef<T>
}
