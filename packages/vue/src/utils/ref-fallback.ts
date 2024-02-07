import { shallowRef, watchSyncEffect } from 'vue-demi'
import type { Ref, ShallowRef } from 'vue-demi'

export function refFallback<T>(
	get: () => T,
): Ref<T> {
	const result = shallowRef<T>()
	watchSyncEffect(() => {
		result.value = get()
	})

	return result as ShallowRef<T>
}
