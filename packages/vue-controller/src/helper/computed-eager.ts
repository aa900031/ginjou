import type { Ref, WatchOptionsBase } from 'vue-demi'
import { computed, shallowRef, unref, watchEffect } from 'vue-demi'

export function computedWirteEager<T>(props: {
	get: () => T
	set: (val: T) => void
	options?: WatchOptionsBase
}): Ref<T> {
	const result = shallowRef()

	watchEffect(() => {
		result.value = props.get()
	}, {
		...props.options,
		flush: props.options?.flush ?? 'sync',
	})

	return computed<T>({
		get: () => unref(result),
		set: props.set,
	})
}
