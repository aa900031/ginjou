import type { Ref, ShallowRef } from 'vue-demi'
import { shallowRef, watch } from 'vue-demi'

export function deriveRef<T, TSource>(
	source: () => TSource,
	derive: (source: TSource, prev?: T | undefined) => T,
): Ref<T> {
	const result = shallowRef<T>()

	watch(source, (value) => {
		result.value = derive(value, result.value)
	}, {
		flush: 'sync',
		immediate: true,
	})

	return result as ShallowRef<T>
}
