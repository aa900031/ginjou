import type { UnwrapRef } from 'vue-demi'
import { unref } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'

export type UnwrapRefs<T extends Record<string, MaybeRef<any>>> = {
	[K in keyof T]: UnwrapRef<T[K]>
}

export function unrefs<T extends Record<string, MaybeRef<any>>>(
	value: T,
): UnwrapRefs<T> {
	const result = {} as UnwrapRefs<T>
	for (const key in value) {
		if (Object.prototype.hasOwnProperty.call(value, key))
			result[key] = unref(value[key])
	}

	return result
}
